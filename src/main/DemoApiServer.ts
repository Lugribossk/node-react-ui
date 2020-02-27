import DemoEndpoints from "../shared/DemoEndpoints";

export default class DemoApiServer implements DemoEndpoints {
    [name: string]: (...args: any[]) => Promise<any>;

    async getLength(text: string) {
        return {length: text.length};
    }
}
