from rest_framework import serializers

from . import models


class ProductoSerializer(serializers.ModelSerializer):
    imagen = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = models.Producto
        fields = '__all__'
