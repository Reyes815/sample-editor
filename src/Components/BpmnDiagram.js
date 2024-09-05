import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'bpmn-js/dist/assets/diagram-js.css';
import BpmnJS from 'bpmn-js/dist/bpmn-modeler.development.js';
import React, { useEffect, useRef, useState } from 'react';
import ImportDiagram from './importDiagram';

const BpmnDiagram = () => {
  const [fileContent, setFileContent] = useState('');

  const modeler = useRef(null);

  const handleFileSelect = (content) => {
    setFileContent(content);
    openImportedDiagram(content);
  };
  const parseXML = (xmlString) => {
    // Parse XML string to DOM
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    // Step 2: Locate the <bpmn2:startEvent> element
    const startEvent = xmlDoc.getElementsByTagName('bpmn2:startEvent')[0];

    const endEvent = xmlDoc.getElementsByTagName('bpmn2:endEvent')[0];

    // Initialize an array to store activities and sequence flows
    const activities = [];
    const sequenceFlows = [];
    const gateways = [];
    const endEvents = [];


    // Step 3: Extract and store the id attribute
    if (startEvent && endEvent) {
      const startEventId = startEvent.getAttribute('id');

      const endEventId = endEvent.getAttribute('id');

      // Get all sequence flows
      const flows = xmlDoc.getElementsByTagName('bpmn2:sequenceFlow');
      for (let flow of flows) {
        const id = flow.getAttribute('id');
        const name = flow.getAttribute('name');
        const sourceRef = flow.getAttribute('sourceRef');
        const targetRef = flow.getAttribute('targetRef');
        sequenceFlows.push({ id, name, sourceRef, targetRef });
      }

      // Get all tasks
      const tasks = xmlDoc.getElementsByTagName('bpmn2:task');
      for (let task of tasks) {
        const taskId = task.getAttribute('id');
        const taskName = task.getAttribute('name');

        // Ensure task has a name
        if (taskName) {
          activities.push({
            id: taskId,
            name: taskName,
          });
        }
      }

      // Check if every activity is connected by a sequence flow
      for (let activity of activities) {
        const isConnected = sequenceFlows.some(flow => 
          flow.sourceRef === activity.id || flow.targetRef === activity.id
        );

        if (!isConnected) {
          console.error(`Error: Activity ${activity.name} (id: ${activity.id}) is not connected by any sequence flow.`);
          return null; // Stop further processing if an error is found
        }
      }

      return { startEventId, endEventId, activities, sequenceFlows };

    } else {
      console.error('Start Event not found!');
    }
  };

  const translateToPlantUML = (data) => {
    if (!data || !data.startEventId || !data.endEventId) {
      return '@startuml\nNo start or end event found\n@enduml';
    }
  
    // Start with basic PlantUML BPMN syntax
    let plantUML = '@startuml\n';
  
    // Add the start event flow
    if (data.activities.length > 0) {
      plantUML += `(*) --> "${data.activities[0].name}"\n`;
    }

  
    // Add each activity as a PlantUML action
    // data.activities.forEach(activity => {
    //   plantUML += `:${activity.name};\n`;
    // });

    // Add sequence flows between activities
    data.sequenceFlows.forEach(flow => {
      const sourceActivity = data.activities.find(activity => activity.id === flow.sourceRef);
      const targetActivity = data.activities.find(activity => activity.id === flow.targetRef);

      if (sourceActivity && targetActivity) {
        plantUML += `"${sourceActivity.name}" --> "${targetActivity.name}"\n`;
      }
    });

    // Add the end event flow
    if (data.activities.length > 0) {
      plantUML += `"${data.activities[data.activities.length - 1].name}" --> (*)\n`;
    }
  
    // End the diagram
    plantUML += '@enduml';
  
    return plantUML;
  };

  const openDiagram = async () => {
    const response = await fetch('empty_bpmn.bpmn');
    const diagram = await response.text();
    
    // console.log('Fetched BPMN XML:', diagram);

    try {
      await modeler.current.importXML(diagram);
      const canvas = modeler.current.get('canvas');
      canvas.zoom('fit-viewport');
    } catch (err) {
      console.error('Error importing diagram:', err);
    }
  };

  const openImportedDiagram = async (diagram) => {
    
    try {
      await modeler.current.importXML(diagram);
      const canvas = modeler.current.get('canvas');
      canvas.zoom('fit-viewport');
    } catch (err) {
      console.error('Error importing diagram:', err);
    }
  };

  const saveDiagram = async () => {
    try {
      const { xml } = await modeler.current.saveXML({ format: true });

      const data = parseXML(xml);

      // modeler.current.destroy();

      const plantUML = translateToPlantUML(data);

      // modeler.current = new BpmnJS({
      //   container: '#canvas',
      //   keyboard: { bindTo: window },
      // });

      // openDiagram();
      
      console.log(plantUML);

      console.log(data);

      console.log(xml);

      // You can now save the XML string to a file or send it to a server
    } catch (err) {
      console.error('Could not save BPMN diagram:', err);
    }
  };

  useEffect(() => {
      modeler.current = new BpmnJS({
      container: '#canvas',
      keyboard: { bindTo: window },
    });

    openDiagram();

    return () => {
      modeler.current.destroy();
    };
  }, []);

  return (
    <div>
      <h1>BPMN Diagram Modeler</h1>
      <div id="canvas" style={{ width: '100%', height: '600px', border: '1px solid black' }}></div>
      <button onClick={saveDiagram}>Save Diagram</button>
      <ImportDiagram onFileSelect={handleFileSelect} />
      
    </div>
  );
};

export default BpmnDiagram;
