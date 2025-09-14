export default {
  "nodes": [
    {
      "id": "1",
      "type": "custom",
      "position": {
        "x": 579.9999999999999,
        "y": 191
      },
      "measured": {
        "width": 120,
        "height": 43
      },
      "selected": false,
      "dragging": false,
      "data": {
        "label": "hi"
      }
    },
    {
      "id": "2",
      "type": "custom",
      "position": {
        "x": 794.9999999999999,
        "y": 227.5
      },
      "measured": {
        "width": 120,
        "height": 43
      },
      "selected": false,
      "data": {
        "label": "Hello"
      }
    }
  ],
  "edges": [
    {
      "source": "1",
      "sourceHandle": "right",
      "target": "2",
      "targetHandle": "left",
      "markerEnd": {
        "type": "arrowclosed"
      },
      "id": "xy-edge__1right-2left"
    },
    {
      "source": "2",
      "sourceHandle": "top",
      "target": "1",
      "targetHandle": "top",
      "markerEnd": {
        "type": "arrowclosed"
      },
      "id": "xy-edge__2top-1top"
    },
    {
      "source": "1",
      "sourceHandle": "left",
      "target": "2",
      "targetHandle": "bottom",
      "markerEnd": {
        "type": "arrowclosed"
      },
      "id": "xy-edge__1left-2bottom"
    }
  ]
}