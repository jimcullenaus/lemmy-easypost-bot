type Env = NodeJS.ProcessEnv;

export default class AppConfig {
    public readonly loginInstanceName: string;
    public readonly username: string;
    public readonly password: string;
    public readonly timezone: string;

    private constructor(env : Env) {
        this.loginInstanceName = AppConfig.requireEnv(env, 'LOGIN_INSTANCE_NAME');
        this.username = AppConfig.requireEnv(env, 'USERNAME');
        this.password = AppConfig.requireEnv(env, 'PASSWORD');
        this.timezone = AppConfig.requireEnv(env, 'TIMEZONE');
    }

    public static fromEnvironment(env : Env = process.env) : AppConfig {
        return new AppConfig(env);
    }

    private static requireEnv(env : Env, key : string) : string {
        const value = AppConfig.sanitise(env[key]);
        if (!value) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
        return value;
    }

    private static sanitise(value : string | undefined) : string {
        if (value === undefined) {
            return '';
        }

        const trimmed = value.trim();
        if (trimmed.length >= 2 && trimmed[0] === trimmed[trimmed.length - 1]) {
            const isDoubleQuoted = trimmed.startsWith('"') && trimmed.endsWith('"');
            const isSingleQuoted = trimmed.startsWith("'") && trimmed.endsWith("'");
            if (isDoubleQuoted || isSingleQuoted) {
                return trimmed.slice(1, -1).trim();
            }
        }

        return trimmed;
    }
}
