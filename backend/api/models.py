from django.db import models

# Create your models here.

class Producto(models.Model):
    nombre = models.CharField(max_length=50)
    categoria = models.CharField(max_length=50)
    precio = models.DecimalField(decimal_places=2, max_digits=12)
    existencias = models.IntegerField()
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)
