import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedEvent: JSON.parse(localStorage.getItem("selectedEvent")) || null,
  selectedTicket: JSON.parse(localStorage.getItem("selectedTicket")) || null,
  bookedData: null,
};

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload;
      localStorage.setItem("selectedEvent", JSON.stringify(action.payload));
    },
    setSelectedTicket: (state, action) => {
      state.selectedTicket = action.payload;
      localStorage.setItem("selectedTicket", JSON.stringify(action.payload));
    },
    setEventBookedData: (state, action) => {
      state.bookedData = action.payload;
    },
    resetBookingData: (state) => {
      state.selectedEvent = null;
      state.selectedTicket = null;
      state.bookedData = null;
      localStorage.removeItem("selectedEvent");
      localStorage.removeItem("selectedTicket");
    },
  },
});

export const {
  setSelectedEvent,
  resetBookingData,
  setSelectedTicket,
  setEventBookedData,
} = eventsSlice.actions;

export default eventsSlice.reducer;
