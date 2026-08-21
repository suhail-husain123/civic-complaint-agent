from langgraph.graph import (
    StateGraph,
    START,
    END
)

from agent.state import ComplaintAgentState

from agent.nodes import (
    load_memory,
    analyze_complaint,
    confidence_router,
    auto_route,
    manual_review
)


# -------------------------
# CREATE GRAPH
# -------------------------

builder = StateGraph(
    ComplaintAgentState
)


# -------------------------
# ADD NODES
# -------------------------

builder.add_node(
    "load_memory",
    load_memory
)

builder.add_node(
    "analyze",
    analyze_complaint
)

builder.add_node(
    "auto_route",
    auto_route
)

builder.add_node(
    "manual_review",
    manual_review
)


# -------------------------
# START → MEMORY
# -------------------------

builder.add_edge(
    START,
    "load_memory"
)


# -------------------------
# MEMORY → GEMINI ANALYSIS
# -------------------------

builder.add_edge(
    "load_memory",
    "analyze"
)


# -------------------------
# CONDITIONAL ROUTING
# -------------------------

builder.add_conditional_edges(
    "analyze",
    confidence_router,
    {
        "auto_route": "auto_route",
        "manual_review": "manual_review"
    }
)


# -------------------------
# FINISH WORKFLOW
# -------------------------

builder.add_edge(
    "auto_route",
    END
)

builder.add_edge(
    "manual_review",
    END
)


# -------------------------
# COMPILE GRAPH
# -------------------------

complaint_graph = builder.compile()