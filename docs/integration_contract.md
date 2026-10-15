# Future handoff to P2B (proposed interface only)

Georensis prepares spatial site options. P2B/authorized network study tools decide technical grid acceptability. Do not recreate a power-flow or contingency engine in this repo.

Example study request fields (schema proposal, NOT live integration):
- study_request_id; analysis_snapshot_at; site_id
- site_geometry (GeoJSON); site_centroid_wgs84
- candidate_gi_asset_id; candidate_voltage_kv; candidate_circuit_id if confirmed
- proposed_capacity_mwp; proposed_export_limit_mwac; proposed_cod
- solar profile identifier and source; output control/BESS scenario if required
- assumptions; evidence links; creator and workflow status

Example P2B response fields (only after actual integration):
- study_id; study_model_version; study_snapshot_at
- candidate_point_of_connection; configuration / network reinforcement
- max_permitted_injection_mwac; conditions; N-1 status; voltage constraints
- curtailment assessment if studied; study_document_reference; approver

Never invent a value for max permitted injection, curtailment or N-1. All network analytics are explicitly out of scope of the PoC.

Interconnection option shortlist should retain multiple candidates because the nearest GI or SUTT may be unavailable, unsuitable, or more costly after validation.
