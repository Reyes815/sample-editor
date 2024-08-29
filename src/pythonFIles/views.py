from django.shortcuts import render
from django.http import HttpResponse

def modeler(request):
    return render(request, 'core/modeler.html')

def download_bpmn(request):
    # Here you could generate the BPMN XML dynamically or serve a static file
    bpmn_content = '''<?xml version="1.0" encoding="UTF-8"?>
        <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_1">
            <bpmn:process id="Process_1">
                <bpmn:startEvent id="StartEvent_1"/>
                <bpmn:endEvent id="EndEvent_1"/>
            </bpmn:process>
        </bpmn:definitions>'''

    response = HttpResponse(bpmn_content, content_type='application/bpmn+xml')
    response['Content-Disposition'] = 'attachment; filename="your_diagram.bpmn"'
    return response
