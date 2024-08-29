from django.urls import path
from . import views

urlpatterns = [
    path('modeler/', views.modeler, name='modeler'),
    path('download-bpmn/', views.download_bpmn, name='download_bpmn'),
]
