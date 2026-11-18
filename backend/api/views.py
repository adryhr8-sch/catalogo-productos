from rest_framework import viewsets

from . import models, serializers

# Create your views here.

class ProductosViewSet(viewsets.ModelViewSet):
    queryset = models.Producto.objects.all()
    serializer_class = serializers.ProductoSerializer
