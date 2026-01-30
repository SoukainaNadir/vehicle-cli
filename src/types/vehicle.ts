export interface Vehicle {
  id: number;
  shortcode: string;
  battery: number;
  position: {
    latitude: number;
    longitude: number;
  };
}
