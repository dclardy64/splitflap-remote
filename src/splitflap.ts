import { SplitFlap } from "./lib/Splitflap";

export let splitflap: SplitFlap

console.debug = () => {}

export const InitalizeSplitflap = async () => {
    console.log('Splitflap initalizing...')
    const ports = await SplitFlap.GetSerialPorts()
    if (ports.length === 0) {
        console.error('FATAL: No splitflap serial port found!')
        process.exit(1)
    }
    splitflap = new SplitFlap(ports[0].path)
    await splitflap.Initalize()
    console.log('Splitflap ready.')
}
