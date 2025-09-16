
from django.apps import AppConfig

class AeronConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'aeron'
    verbose_name = 'AERON Flight Recovery System'
    
    def ready(self):
        # Import signal handlers if needed
        pass
