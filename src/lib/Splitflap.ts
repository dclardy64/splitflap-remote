import SerialPort from 'serialport'

import { SplitflapNode } from 'splitflapjs-node'
import { PB } from 'splitflapjs-proto'
import { applySetFlaps, applyResetModules } from 'splitflapjs-core/dist/util.js'
import EventEmitter from 'events'


type NoUndefinedField<T> = {
  [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>>
}

type SplitflapConfig = PB.SplitflapConfig
type SplitFlapState = NoUndefinedField<PB.ISplitflapState>
type SplitFlapGeneralState = NoUndefinedField<PB.IGeneralState>
type SplitFlapLog = [Date, string]

type CallbackFunction<T> = (value: T) => void
type AsyncCallbackFunction<T> = (value: T) => Promise<void>

interface SplitFlapEvents {
  'ready': CallbackFunction<void> | AsyncCallbackFunction<void>,
  'flaps': CallbackFunction<{ flaps: string, isMoving: boolean }> | AsyncCallbackFunction<{ flaps: string, isMoving: boolean }>,
  // Raw Events
  'state': CallbackFunction<PB.SplitflapState> | AsyncCallbackFunction<PB.SplitflapState>,
  'general-state': CallbackFunction<PB.IGeneralState> | AsyncCallbackFunction<PB.IGeneralState>,
  'log': CallbackFunction<SplitFlapLog> | AsyncCallbackFunction<SplitFlapLog>,
}

export declare interface SplitFlap {
  on: <U extends keyof SplitFlapEvents>(
    event: U, listener: SplitFlapEvents[U]
  ) => this

  emit: <U extends keyof SplitFlapEvents>(
    event: U, ...args: Parameters<SplitFlapEvents[U]>
  ) => boolean
}

export class SplitFlap extends EventEmitter {

  static async GetSerialPorts() {
    const ports = (await SerialPort.list()).filter((portInfo) => {
      return SplitflapNode.USB_DEVICE_FILTERS.some(
        (f) =>
          f.usbVendorId.toString(16) === portInfo.vendorId &&
          f.usbProductId.toString(16) === portInfo.productId,
      )
    })
    return ports
  }

  static #notReadyError = new Error('Splitflap not yet initalized..')

  // Private Members
  #splitflap: SplitflapNode
  #splitflapConfig: SplitflapConfig = PB.SplitflapConfig.create({ modules: [] })
  #generalState: null | SplitFlapGeneralState = null
  #state: SplitFlapState = { modules: [], loopbacksOk: false }
  #logs: SplitFlapLog[] = []

  #flapCharacterSet: string[] = [ // Legacy flaps
    ' ', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
    'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
    'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2',
    '3', '4', '5', '6', '7', '8', '9', '.', '!', "'",
  ]

  #moduleIndexMapping: null | number[] = null

  #isReady = false
  #isMoving = false

  constructor(port: string) {
    super()
    this.#splitflap = new SplitflapNode(port, (message: PB.FromSplitflap) => {
      if (message.payload === 'generalState' && message.generalState !== null) {
        const state = PB.GeneralState.create(message.generalState)
        const generalState = PB.GeneralState.toObject(state, { defaults: true }) as SplitFlapGeneralState
        this.#flapCharacterSet = String.fromCharCode(...Array.from(generalState.flapCharacterSet)).split('')
        this.#generalState = generalState
        this.emit('general-state', state)
      } else if (message.payload === 'splitflapState' && message.splitflapState !== null) {
        const state = PB.SplitflapState.create(message.splitflapState)
        this.#state = PB.SplitflapState.toObject(state, { defaults: true }) as SplitFlapState
        let isMoving = false
        for (let i = 0; i < this.#state.modules.length; i++) {
          if (this.#state.modules[i].moving) {
            isMoving = true
            break
          }
        }
        this.#isMoving = isMoving
        if (!this.#isReady && !this.#isMoving) {
          this.#isReady = true
          this.emit('ready')
        }
        if (this.#splitflapConfig.modules.length !== this.#state.modules.length) {
          this.#splitflapConfig.modules = Array(this.#state.modules.length).fill(null).map((v, i) => {
            return { targetFlapIndex: 0, resetNonce: 0, movementNonce: 0 }
          })
        }
        if (this.#moduleIndexMapping === null) {
          this.#moduleIndexMapping = Array(this.#splitflapConfig.modules.length).fill(null).map((v, i) => i)
        }
        this.emit('flaps', { flaps: this.GetFlaps(), isMoving: this.#isMoving })
        this.emit('state', state)
      } else if (message.payload === 'log' && message.log !== null) {
        const newLog = message.log?.msg
        if (newLog != null) {
          const ts = new Date()
          this.#logs = this.#logs.slice(-24)
          this.#logs.push([ts, newLog])
          this.emit('log', [ts, newLog])
        }
      }
    })
    this.#splitflap.sendConfig(this.#splitflapConfig)
  }

  async Initalize(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const interval = setInterval((): void => {
        if (this.#isReady) {
          clearInterval(interval)
          resolve()
        }
      }, 0)
    })
  }

  async WaitForEndOfMovement() {
    return new Promise<void>((resolve, reject) => {
      const interval = setInterval((): void => {
        if (!this.#isMoving) {
          clearInterval(interval)
          resolve()
        }
      }, 0)
    })
  }

  SetModuleIndexMapping(mapping: number[]) {
    if (this.#splitflapConfig.modules.length !== mapping.length) {
      throw new Error(`SetModuleIndexMapping: mapping length invalid. expected length: ${this.#state.modules.length}.`)
    }
    this.#moduleIndexMapping = mapping
  }


  // State/Stats/Logs
  GetFlapCharacterSet() {
    return this.#flapCharacterSet
  }
  GetLogs(): [Date, string][] { return this.#logs }
  GetState(): SplitFlapState {
    if (this.#state === null) throw SplitFlap.#notReadyError
    return this.#state
  }
  GetGeneralState(): null | SplitFlapGeneralState {
    return this.#generalState
  }

  // Calibration
  OffsetIncrementTenth(moduleIndex: number) {
    if (this.#moduleIndexMapping === null) {
      throw SplitFlap.#notReadyError
    }
    this.#splitflap.offsetIncrementTenth(this.#moduleIndexMapping[moduleIndex])
  }
  OffsetIncrementHalf(moduleIndex: number) {
    if (this.#moduleIndexMapping === null) {
      throw SplitFlap.#notReadyError
    }
    this.#splitflap.offsetIncrementHalf(this.#moduleIndexMapping[moduleIndex])
  }
  async OffsetSetShownFlap(moduleIndex: number, char: string) {
    if (this.#moduleIndexMapping === null) {
      throw SplitFlap.#notReadyError
    }
    if (this.#flapCharacterSet.indexOf(char) === -1) {
      throw new Error('OffsetSetShownFlap: invalid char set')
    }
    this.SetFlapByIndex(moduleIndex, (this.#flapCharacterSet.length - this.#flapCharacterSet.indexOf(char)) % this.#flapCharacterSet.length)
    await this.WaitForEndOfMovement()
    this.#splitflap.offsetSetToCurrentStep(this.#moduleIndexMapping[moduleIndex])
  }
  OffsetsSaveAll() {
    this.#splitflap.saveAllOffsets()
  }

  GetModuleCount() {
    return this.#state.modules.length
  }

  // Get current displayed flap
  GetFlap(moduleIndex: number): string {
    if (this.#moduleIndexMapping === null) {
      throw SplitFlap.#notReadyError
    }
    const flapIndex = this.#state.modules[this.#moduleIndexMapping[moduleIndex]].flapIndex
    return this.#flapCharacterSet[flapIndex]
  }

  // Get current displayed flaps
  GetFlaps(): string {
    if (this.#moduleIndexMapping === null) {
      throw SplitFlap.#notReadyError
    }
    const flaps = this.#state.modules.map((v) => this.#flapCharacterSet[v.flapIndex])
    const adjustedFlaps = Array(flaps.length).fill('')
    for (let i = 0; i < flaps.length; i++) {
      adjustedFlaps[i] = flaps[this.#moduleIndexMapping[i]]
    }
    return adjustedFlaps.join('')
  }

  // Set a single flap to character index
  SetFlapByIndex(moduleIndex: number, characterIndex: number, forceMovement: boolean = false) {
    if (moduleIndex < 0 || moduleIndex >= this.#state.modules.length) {
      throw new Error('SetFlapByIndex: invalid moduleIndex given.')
    }
    if (characterIndex < 0 || characterIndex >= this.#flapCharacterSet.length) {
      throw new Error('SetFlapByIndex: invalid characterIndex given.')
    }
    if (this.#moduleIndexMapping === null) {
      throw SplitFlap.#notReadyError
    }
    this.#isMoving = true
    this.#splitflapConfig.modules[this.#moduleIndexMapping[moduleIndex]].targetFlapIndex = characterIndex
    if (forceMovement)
      this.#splitflapConfig.modules[this.#moduleIndexMapping[moduleIndex]].movementNonce = ((this.#splitflapConfig.modules[this.#moduleIndexMapping[moduleIndex]].movementNonce || 0) + 1) % 256

    this.#splitflap.sendConfig(this.#splitflapConfig)
  }

  #isValidFlaps(message: string) {
    let valid = true
    for (let i = 0; i < message.length; i++) {
      if (this.#flapCharacterSet.indexOf(message[i]) === -1) {
        valid = false
        break;
      }
    }
    return valid
  }

  // Set single flap to character
  SetFlap(moduleIndex: number, char: string, forceMovement: boolean = false) {
    return this.SetFlapByIndex(moduleIndex, this.#flapCharacterSet.indexOf(char), forceMovement)
  }

  // Set flaps to string message
  SetFlaps(message: string): void {
    if (this.#moduleIndexMapping === null) {
      throw SplitFlap.#notReadyError
    }
    if (!this.#isValidFlaps(message)) {
      throw new Error("An invalid flap character was set. Valid chars: " + this.#flapCharacterSet.join(', '))
    }
    if(message === this.GetFlaps()) {
      return
    }
    const modulePositions = message
      .slice(0, this.#state.modules.length)
      .padEnd(this.#state.modules.length)
      .split('')
      .map((c) => this.#flapCharacterSet.indexOf(c))
    this.SetFlapsByIndex(modulePositions)
  }

  // Set flaps to character index array
  SetFlapsByIndex(indexArray: (number | null)[]) {
    if (indexArray.length !== this.#state.modules.length) {
      throw new Error(`SetFlapsByIndex: invalid indexArray length. Expected: ${this.#state.modules.length}.`)
    }
    if (this.#moduleIndexMapping === null) {
      throw SplitFlap.#notReadyError
    }
    this.#isMoving = true
    const adjustedModulePositions: (number | null)[] = Array(indexArray.length).fill(null)
    for (let i = 0; i < indexArray.length; i++) {
      adjustedModulePositions[this.#moduleIndexMapping[i]] = indexArray[i]
    }
    this.#splitflapConfig = applySetFlaps(this.#splitflapConfig, adjustedModulePositions)
    this.#splitflap.sendConfig(this.#splitflapConfig)
  }

  ResetFlaps(): void {
    if (this.#moduleIndexMapping === null) {
      throw SplitFlap.#notReadyError
    }
    this.#isMoving = true
    this.#isReady = false
    const resetList = Array(this.#splitflapConfig.modules.length).fill(true)
    this.#splitflapConfig = applyResetModules(this.#splitflapConfig, resetList)
    this.#splitflap.sendConfig(this.#splitflapConfig)
  }
  ResetFlap(moduleIndex: number) {
    if (this.#moduleIndexMapping === null) {
      throw SplitFlap.#notReadyError
    }
    this.#isMoving = true
    this.#isReady = false
    const resetList = Array(this.#splitflapConfig.modules.length).fill(false)
    resetList[this.#moduleIndexMapping[moduleIndex]] = true
    this.#splitflapConfig = applyResetModules(this.#splitflapConfig, resetList)
    this.#splitflap.sendConfig(this.#splitflapConfig)
  }
  async HardReset() {
    return this.#splitflap.hardReset()
  }

}