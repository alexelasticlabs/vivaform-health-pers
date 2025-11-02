/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_META_PIXEL_ID?: string;
	readonly VITE_GOOGLE_ADS_ID?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}