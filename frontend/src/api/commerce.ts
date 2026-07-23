import { apiClient } from "./client";
import type { Banner, CommercialMetrics, Coupon, CouponValidation, Promotion } from "../types/commerce";

export const getCoupons = async () => (await apiClient.get<Coupon[]>("/commerce/coupons/")).data;
export const createCoupon = async (data: Partial<Coupon>) => (await apiClient.post<Coupon>("/commerce/coupons/", data)).data;
export const updateCoupon = async (id: number, data: Partial<Coupon>) => (await apiClient.patch<Coupon>(`/commerce/coupons/${id}/`, data)).data;
export const deleteCoupon = async (id: number) => { await apiClient.delete(`/commerce/coupons/${id}/`); };
export const getPromotions = async () => (await apiClient.get<Promotion[]>("/commerce/promotions/")).data;
export const createPromotion = async (data: Partial<Promotion>) => (await apiClient.post<Promotion>("/commerce/promotions/", data)).data;
export const updatePromotion = async (id: number, data: Partial<Promotion>) => (await apiClient.patch<Promotion>(`/commerce/promotions/${id}/`, data)).data;
export const deletePromotion = async (id: number) => { await apiClient.delete(`/commerce/promotions/${id}/`); };
export const getBanners = async () => (await apiClient.get<Banner[]>("/commerce/banners/")).data;
export const getActiveBanners = async () => (await apiClient.get<Banner[]>("/commerce/banners/active/")).data;
export const createBanner = async (data: Partial<Banner>) => (await apiClient.post<Banner>("/commerce/banners/", data)).data;
export const updateBanner = async (id: number, data: Partial<Banner>) => (await apiClient.patch<Banner>(`/commerce/banners/${id}/`, data)).data;
export const deleteBanner = async (id: number) => { await apiClient.delete(`/commerce/banners/${id}/`); };
export const validateCoupon = async (code: string) => (await apiClient.post<CouponValidation>("/commerce/coupon/validate/", { code })).data;
export const getCommercialMetrics = async () => (await apiClient.get<CommercialMetrics>("/commerce/metrics/")).data;
