from agent.graph import complaint_graph


initial_state = {
    "complaint_id": 1,
    "description": "There is an exposed electric wire hanging near a school.",
    "status": "SUBMITTED"
}


result = complaint_graph.invoke(
    initial_state
)

print(result)