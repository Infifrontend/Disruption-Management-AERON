
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET"])
def health_check(request):
    """Health check endpoint for the Django application"""
    return JsonResponse({
        'status': 'healthy',
        'timestamp': '2025-01-16T13:16:24.156Z',
        'application': 'AERON Django Backend',
        'version': '1.0.0',
        'environment': settings.DEBUG and 'development' or 'production'
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('aeron.urls')),
    path('health/', health_check, name='health_check'),
    path('', health_check, name='root'),  # Root endpoint redirects to health check
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
