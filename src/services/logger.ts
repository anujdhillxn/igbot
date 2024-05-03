export const getLogger = (username: string, method: string) => {
    return {
        info: (...args: any[]) => {
            console.log(
                `${method}, ${username}, ${new Date()}: ${args.join(" ")}`
            );
        },
    };
};
