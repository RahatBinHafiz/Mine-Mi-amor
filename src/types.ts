export interface TimelineItem {
  id: number;
  date: string;
  title: string;
  description: string;
  defaultImage: string; // fallback illustration or placeholder
}

export interface ReasonItem {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export interface GalleryPhoto {
  id: string;
  stringData: string;
}
