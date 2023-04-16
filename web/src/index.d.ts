declare module '*.png';
declare module "*.module.scss";

interface ImportMetaEnv {
    // más variables aquí
}

// Para el soporte de la propiedad env en import.meta
interface ImportMeta {
    env: ImportMetaEnv;
}