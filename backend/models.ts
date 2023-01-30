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

export interface dbUser {
  id: string;
  client: any;
  skins: string[];
  tokens: string[];
  notify: boolean;
}
export interface StoreOffer {
  OfferID: string;
  IsDirectPurchase: boolean;
  StartDate: string;
  Cost: Cost;
  Rewards: Reward[];
}

export interface Cost {
  "85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741": number;
}

export interface Reward {
  ItemTypeID: string;
  ItemID: string;
  Quantity: number;
}
