export interface Store {
  bundles: Bundle[];
  skins: Skin[];
  remainingTime: number;
}

export interface Bundle {
  name: string;
  image: string;
  price: number;
  remainingTime: number;
}

export interface Skin {
  uuid: string;
  name: string;
  image: string;
  price: number;
}
