from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views


router = DefaultRouter()

router.register('', views.ProductosViewSet, basename='producto')

urlpatterns = [
    path('', include(router.urls)),
]
