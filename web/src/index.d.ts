declare module '*.png';
declare module "*.module.scss";

interface ImportMetaEnv {
    VITE_FRONT_END_PORT: string;
    VITE_WEB_SERVER: string;
    // más variables aquí
}

// Para el soporte de la propiedad env en import.meta
interface ImportMeta {
    env: ImportMetaEnv;
}