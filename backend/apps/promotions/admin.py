from django.contrib import admin

from .models import Banner, Coupon, CouponUsage, Promotion

admin.site.register(Banner)
admin.site.register(Coupon)
admin.site.register(Promotion)
admin.site.register(CouponUsage)
