export type JWTPayloadType = {
  id: number;
  email: string;
};

export enum OrderStatus {
  PLACED = 'placed',
  PAID = 'paid',
  IN_PROGRESS = 'inProgress',
  OUT_FOR_DELIVERY = 'outForDelivery',
  DELIVERED = 'delivered',
}
