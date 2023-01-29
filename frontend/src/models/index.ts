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

export interface SkinsResponse {
  status: number;
  data: Skin[];
}

export interface Skin {
  uuid: string;
  displayName: string;
  themeUuid: string;
  contentTierUuid: null | string;
  displayIcon: null | string;
  wallpaper: null | string;
  assetPath: string;
  chromas: Chroma[];
  levels: Level[];
}

export interface Chroma {
  uuid: string;
  displayName: string;
  displayIcon: null | string;
  fullRender: string;
  swatch: null | string;
  streamedVideo: null | string;
  assetPath: string;
}

export interface Level {
  uuid: string;
  displayName: string;
  levelItem: LevelItem | null;
  displayIcon: null | string;
  streamedVideo: null | string;
  assetPath: string;
}

export enum LevelItem {
  EEquippableSkinLevelItemAnimation = "EEquippableSkinLevelItem::Animation",
  EEquippableSkinLevelItemFinisher = "EEquippableSkinLevelItem::Finisher",
  EEquippableSkinLevelItemFishAnimation = "EEquippableSkinLevelItem::FishAnimation",
  EEquippableSkinLevelItemHeartbeatAndMapSensor = "EEquippableSkinLevelItem::HeartbeatAndMapSensor",
  EEquippableSkinLevelItemInspectAndKill = "EEquippableSkinLevelItem::InspectAndKill",
  EEquippableSkinLevelItemKillBanner = "EEquippableSkinLevelItem::KillBanner",
  EEquippableSkinLevelItemKillCounter = "EEquippableSkinLevelItem::KillCounter",
  EEquippableSkinLevelItemKillEffect = "EEquippableSkinLevelItem::KillEffect",
  EEquippableSkinLevelItemRandomizer = "EEquippableSkinLevelItem::Randomizer",
  EEquippableSkinLevelItemSoundEffects = "EEquippableSkinLevelItem::SoundEffects",
  EEquippableSkinLevelItemTopFrag = "EEquippableSkinLevelItem::TopFrag",
  EEquippableSkinLevelItemVFX = "EEquippableSkinLevelItem::VFX",
  EEquippableSkinLevelItemVoiceover = "EEquippableSkinLevelItem::Voiceover",
}
