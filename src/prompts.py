
TOOL_INSTRUCTIONS = """
# Google Calendar Event Creation Tool Example - Return the tool arguments as DICT
tool_request:
  tool_name: "GOOGLE_CALENDAR__EVENTS_INSERT"
  description: "Creates an event in the specified calendar"

tool_arguments:
  path:
    calendarId: "jag00277@gmail.com"  # Calendar identifier, use 'primary' for primary calendar
  body:
    summary: "Dental Appointment"  # Title of the event
    description: "Scheduled dental appointment"  # Detailed description
    start:
      dateTime: "2025-10-15T10:30:00"  # Start time in RFC3339 format
      timeZone: "Europe/Amsterdam"  # Time zone for the start time
    end:
      dateTime: "2025-10-15T11:30:00"  # End time in RFC3339 format
      timeZone: "Europe/Amsterdam"  # Time zone for the end time
    eventType: "default"  # Event type: default, birthday, focusTime, fromGmail, outOfOffice, workingLocation
    visibility: "default"  # Visibility: default, public, private, confidential
    attendees: []  # Optional: List of attendees with email, displayName, optional, responseStatus
    location: ""  # Optional: Geographic location of the event
    guestsCanModify: false  # Optional: Whether attendees can modify the event
    guestsCanInviteOthers: true  # Optional: Whether attendees can invite others
    guestsCanSeeOtherGuests: true  # Optional: Whether attendees can see other guests

tool_response:
  kind: "calendar#event"
  etag: "\"3520398630112894\""
  id: "jr8mr00h0redkv7op8m1kstvuo"
  status: "confirmed"
  htmlLink: "https://www.google.com/calendar/event?eid=anI4bXIwMGgwcmVka3Y3b3A4bTFrc3R2dW8gamFnMDAyNzdAbQ"
  created: "2025-10-11T16:15:14.000Z"
  updated: "2025-10-11T16:15:15.056Z"
  summary: "Dental Appointment"
  description: "Scheduled dental appointment"
  creator:
    email: "jag00277@gmail.com"
    self: true
  organizer:
    email: "jag00277@gmail.com"
    self: true
  start:
    dateTime: "2025-10-15T10:30:00+02:00"
    timeZone: "Europe/Amsterdam"
  end:
    dateTime: "2025-10-15T11:30:00+02:00"
    timeZone: "Europe/Amsterdam"
  iCalUID: "jr8mr00h0redkv7op8m1kstvuo@google.com"
  sequence: 0
  reminders:
    useDefault: true
  eventType: "default"

# Additional Calendar Tools Available:
additional_tools:
  - name: "GOOGLE_CALENDAR__FREEBUSY_QUERY"
    description: "Returns free/busy information for a set of calendars"
    example_args:
      body:
        items:
          - id: "jag00277@gmail.com"
        timeMin: "2025-10-15T00:00:00Z"
        timeMax: "2025-10-15T23:59:59Z"
        timeZone: "Europe/Amsterdam"
    
  - name: "GOOGLE_CALENDAR__EVENTS_LIST"
    description: "Returns events on the specified calendar"
    example_args:
      path:
        calendarId: "jag00277@gmail.com"
      query:
        timeMin: "2025-10-15T00:00:00Z"
        timeMax: "2025-10-15T23:59:59Z"
        timeZone: "Europe/Amsterdam"
        singleEvents: true
    
  - name: "GOOGLE_CALENDAR__EVENTS_UPDATE"
    description: "Updates an existing event in the specified calendar"
    example_args:
      path:
        calendarId: "jag00277@gmail.com"
        eventId: "jr8mr00h0redkv7op8m1kstvuo"
      body:
        # Same structure as EVENTS_INSERT
    
  - name: "GOOGLE_CALENDAR__EVENTS_DELETE"
    description: "Deletes an event from the specified calendar"
    example_args:
      path:
        calendarId: "jag00277@gmail.com"
        eventId: "jr8mr00h0redkv7op8m1kstvuo"

# Key Information for Agent Instructions:
key_points:
  calendar_id: "jag00277@gmail.com"  # Your primary calendar ID
  timezone: "Europe/Amsterdam"  # Your calendar timezone
  default_duration: "1 hour"  # Default appointment duration
  reminder_settings: "30 minutes before (email and popup)"
  date_format: "YYYY-MM-DD"  # Date format for parsing
  time_format: "HH:MM"  # Time format for parsing
  datetime_format: "YYYY-MM-DDTHH:MM:SS"  # Full datetime format for API calls
  # Return the tool arguments as DICT
"""
# DEFAULT_INSTRUCTIONS = """You are a helpful voice AI assistant. The user is interacting with you via voice, even if you perceive the conversation as text.
# You eagerly assist users with their questions by providing information from your extensive knowledge.
# Your responses are concise, to the point, and without any complex formatting or punctuation including emojis, asterisks, or other symbols.
# You are curious, friendly, and have a sense of humor."""

# DEFAULT_INSTRUCTIONS = """You are a receptionist for a dental practice. You are responsible for answering the phone and booking appointments.
# You will be provided with the patient's name, phone number, and appointment type.
# You will also be provided with the patient's insurance information and benefits.

# You will need to book the appointment and confirm the appointment with the patient.

# You will need to check the patient's insurance and verify their benefits.
# """