<!-- AGENT-MEMORY:BEGIN -->
- Community operation destinations use communityPatientAction; pending professional assessments show only missing saved scale keys and remain clinician-administered.
- Doctor/community training history uses shared station records (device/non-device columns above) and category=训练 family check-ins (full-width below), retaining plan versions; counts and recent activity use these same rows for consistency.
- Family check-ins are read-only in staff detail and polled through the shared query; station entries retain device/non-device labels and existing plan-based entry controls.
- TrainingRecordPanel keeps headers fixed and record bodies independently scrollable; PatientTrainingHistory shares the white bordered record layout with family task pages to keep presentation consistent.
- Patient training rows summarize recorded activities in the station row layout; display only recorded difficulty/training clock time, never infer either from submission metadata.
<!-- AGENT-MEMORY:END -->