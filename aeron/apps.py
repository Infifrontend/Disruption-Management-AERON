
from django.apps import AppConfig

class AeronConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'aeron'
    verbose_name = 'AERON Recovery Management'
    
    def ready(self):
        """Called when Django starts up"""
        import logging
        
        # Initialize loggers
        logger = logging.getLogger('aeron')
        logger.info("AERON Django application initialized")
        
        # Create logs directory if it doesn't exist
        import os
        from pathlib import Path
        
        logs_dir = Path(__file__).resolve().parent.parent / 'logs'
        logs_dir.mkdir(exist_ok=True)
        
        logger.info(f"Logs directory created/verified at: {logs_dir}")
