export enum accountStatus {
  loggedIn,
  notLoggedIn,
  needsMFA,
}

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
  name: string;
  image: string;
  price: number;
}
