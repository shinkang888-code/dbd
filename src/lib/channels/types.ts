/** 판매채널 어댑터 인터페이스 — 스펙 §9.2 */
import type { Channel, ChannelListing, Listing, ListingDraft, PurchaseRequest } from "@/lib/hq/types";

export type PublishInput = {
  channel: Channel;
  listing: Listing;
  draft: ListingDraft;
};

export type PulledOrder = {
  externalOrderRef: string;
  externalListingRef?: string;
  buyerName: string;
  buyerCountry: string;
  shippingAddress: Record<string, string>;
  qty: number;
  paidAmount: number;
  currency: string;
  raw?: Record<string, unknown>;
};

export interface ChannelAdapter {
  code: string;
  /** 상품 게시 → 채널측 참조키 반환 */
  publish(input: PublishInput): Promise<{ externalRef: string }>;
  /** 주문 pull (webhook 미지원 채널 폴링용) */
  pullOrders?(channel: Channel, opts: { liveListings: ChannelListing[] }): Promise<PulledOrder[]>;
  /** 발주확인/송장 회신 */
  ackOrder?(channel: Channel, pr: PurchaseRequest, info: { trackingNo?: string; carrier?: string }): Promise<void>;
}
