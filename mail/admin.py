from django.contrib import admin
from .models import Email as Mail
from .models import User
# Register your models here.

admin.site.register(User)
admin.site.register(Mail)