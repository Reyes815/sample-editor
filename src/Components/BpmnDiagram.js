import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'bpmn-js/dist/assets/diagram-js.css';
import BpmnJS from 'bpmn-js/dist/bpmn-modeler.development.js';
import React, { useEffect } from 'react';

const BpmnDiagram = () => {
  useEffect(() => {
    const modeler = new BpmnJS({
      container: '#canvas',
      keyboard: { bindTo: window },
    });

    const openDiagram = async () => {
      const response = await fetch('empty_bpmn.bpmn');
      const diagram = await response.text();
      
      console.log('Fetched BPMN XML:', diagram);

      try {
        await modeler.importXML(diagram);
        const canvas = modeler.get('canvas');
        canvas.zoom('fit-viewport');
      } catch (err) {
        console.error('Error importing diagram:', err);
      }
    };

    openDiagram();

    return () => {
      modeler.destroy();
    };
  }, []);

  return (
    <div>
      <h1>BPMN Diagram Modeler</h1>
      <div id="canvas" style={{ width: '100%', height: '600px', border: '1px solid black' }}></div>
    </div>
  );
};

export default BpmnDiagram;
