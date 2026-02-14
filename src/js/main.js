import { createElement } from "./utils.js";
const notesList = document.querySelector(".list");
const newNoteBtn = document.querySelector(".new-note-btn");
const modal = document.querySelector(".modal");
const modalInput = document.querySelector(".modal__input");
const cancelBtn = document.querySelector("#cancel-modal");
const modalOverlay = document.querySelector(".modal__overlay");
const modalForm = document.querySelector(".modal__form");
const searchInput = document.querySelector(".field__input_search");
const dropDownBtn = document.querySelector(".dropdown__btn");
const dropdownMenu = document.querySelector(".dropdown__menu");

const state = {
  notes: getNotesFromLocalStorage(),
  searchQuery: "",
  statusFilter: "all",
  deletedNote: null,
  deletedIndex: null,
  undoTimer: null,
  undoCountdown: 5,
};

function getNotesFromLocalStorage() {
  const data = localStorage.getItem("note-items");
  if (!data) return [];

  try {
    const parsedData = JSON.parse(data);
    return Array.isArray(parsedData) ? parsedData.filter(Boolean) : [];
  } catch {
    console.error("Notes parse error");
    return [];
  }
}

function saveToLocalStorage() {
  localStorage.setItem("note-items", JSON.stringify(state.notes));
}

function addNewNote(newNoteText) {
  const newNote = {
    id: crypto?.randomUUID() ?? Date.now().toString(),
    text: newNoteText,
    completed: false,
  };
  state.notes.push(newNote);
  saveToLocalStorage();
  renderNotes();
}

function renderEmpty() {
  const empty = createElement({
    tag: "div",
    parent: notesList,
    classNames: ["empty"],
  });
  const emptyImage = createElement({
    tag: "img",
    parent: empty,
    classNames: ["empty__img"],
  });
  emptyImage.src = "src/images/empty-list.png";
  createElement({
    tag: "span",
    text: "Empty...",
    parent: empty,
    classNames: ["empty__text"],
  });
}

function getFilteredNotes() {
  return state.notes
    .filter((note) => note.text.toLowerCase().includes(state.searchQuery))
    .filter((note) => {
      if (state.statusFilter === "all") return true;
      if (state.statusFilter === "complete") return note.completed;
      if (state.statusFilter === "incomplete") return !note.completed;
    });
}

function renderNotes() {
  notesList.innerHTML = "";

  const filteredNotes = getFilteredNotes();

  if (filteredNotes.length === 0) {
    renderEmpty();
  }

  filteredNotes.map((note) => {
    createNote(note);
  });
}

function createNote(newNote) {
  const note = createElement({
    tag: "div",
    parent: notesList,
    classNames: ["note"],
  });
  note.dataset.id = newNote.id;

  const label = createElement({
    tag: "label",
    parent: note,
    classNames: ["note__checkbox", "checkbox"],
  });
  const input = createElement({
    tag: "input",
    parent: label,
    classNames: ["checkbox__input"],
  });
  createElement({
    tag: "span",
    parent: label,
    classNames: ["checkbox__custom"],
  });
  input.type = "checkbox";
  input.checked = newNote.completed;

  const text = createElement({
    tag: "span",
    text: newNote.text,
    parent: label,
    classNames: ["note__text"],
  });
  const noteInput = createElement({
    tag: "input",
    parent: note,
    classNames: ["note__input", "none"],
  });
  noteInput.type = "text";
  noteInput.value = newNote.text;

  const options = createElement({
    tag: "div",
    parent: note,
    classNames: ["note__options"],
  });
  const editOption = createElement({
    tag: "button",
    parent: options,
    classNames: ["option-btn", "edit-btn"],
  });
  editOption.innerHTML = `<svg class="edit-svg" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.17272 3.49106L0.5 10.1637V13.5H3.83636L10.5091 6.82736M7.17272 3.49106L9.5654 1.09837L9.5669 1.09695C9.8962 0.767585 10.0612 0.602613 10.2514 0.540824C10.4189 0.486392 10.5993 0.486392 10.7669 0.540824C10.9569 0.602571 11.1217 0.767352 11.4506 1.09625L12.9018 2.54738C13.2321 2.87769 13.3973 3.04292 13.4592 3.23337C13.5136 3.40088 13.5136 3.58133 13.4592 3.74885C13.3974 3.93916 13.2324 4.10414 12.9025 4.43398L12.9018 4.43468L10.5091 6.82736M7.17272 3.49106L10.5091 6.82736" stroke="#CDCDCD" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  const deleteOption = createElement({
    tag: "button",
    parent: options,
    classNames: ["option-btn", "delete-btn"],
  });

  deleteOption.innerHTML = `
    <svg class="delete-svg" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.87426 7.61505C3.80724 6.74386 4.49607 6 5.36983 6H12.6302C13.504 6 14.1928 6.74385 14.1258 7.61505L13.6065 14.365C13.5464 15.1465 12.8948 15.75 12.1109 15.75H5.88907C5.10526 15.75 4.4536 15.1465 4.39348 14.365L3.87426 7.61505Z" stroke="#CDCDCD"/>
    <path d="M14.625 3.75H3.375" stroke="#CDCDCD" stroke-linecap="round"/>
    <path d="M7.5 2.25C7.5 1.83579 7.83577 1.5 8.25 1.5H9.75C10.1642 1.5 10.5 1.83579 10.5 2.25V3.75H7.5V2.25Z" stroke="#CDCDCD"/>
    <path d="M10.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round"/>
    <path d="M7.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round"/>
    </svg>`;
}

function deleteNote(id) {
  const index = state.notes.findIndex((note) => note.id === id);

  state.deletedNote = state.notes[index];
  state.deletedIndex = index;

  state.notes.splice(index, 1);

  saveToLocalStorage();
  renderNotes();
}

function showUndo() {
  const undoBtn = document.querySelector(".undo-btn");
  const undoCount = undoBtn.querySelector(".undo-btn__count");
  state.undoCountdown = 5;

  undoBtn.classList.add("visible");
  undoCount.textContent = state.undoCountdown;

  clearInterval(state.undoTimer);

  state.undoTimer = setInterval(() => {
    state.undoCountdown--;
    undoCount.textContent = state.undoCountdown;

    if (state.undoCountdown === 0) {
      clearInterval(state.undoTimer);
      undoBtn.classList.remove("visible");
      state.deletedNote = null;
      state.deletedIndex = null;
    }
  }, 1000);

  undoBtn.addEventListener("click", () => {
    if (!state.deletedNote) return;

    state.notes.splice(state.deletedIndex, 0, state.deletedNote);
    clearInterval(state.undoTimer);
    undoBtn.classList.remove("visible");

    saveToLocalStorage();
    renderNotes();

    state.deletedNote = null;
    state.deletedIndex = null;
  });
}

function toggleCompletedNote(id) {
  state.notes = state.notes.map((note) => {
    if (note.id === id) {
      return {
        ...note,
        completed: !note.completed,
      };
    }

    return note;
  });

  saveToLocalStorage();
  renderNotes();
}

function startEdit(noteElem) {
  const noteId = noteElem.dataset.id;
  const noteInput = noteElem.querySelector(".note__input");
  const noteText = noteElem.querySelector(".note__text");
  const editBtn = noteElem.querySelector(".edit-btn");
  const deleteBtn = noteElem.querySelector(".delete-btn");

  noteElem.classList.add("note--editing");
  noteText.classList.add("none");
  noteInput.classList.remove("none");

  noteInput.value = noteText.textContent;
  noteInput.focus();

  editBtn.innerHTML = `<svg width="17" height="17" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="path-1-inside-1_18_421" fill="white">
    <path d="M4.9978 14.6488L1.72853e-05 9.74756L9.55927 3.20136e-07L14.5571 4.90124L4.9978 14.6488Z"/>
    </mask>
    <path d="M4.9978 14.6488L3.59745 16.0767L5.02539 17.4771L6.42574 16.0491L4.9978 14.6488ZM6.39816 13.2209L1.40037 8.31962L-1.40034 11.1755L3.59745 16.0767L6.39816 13.2209ZM13.1291 3.50089L3.56986 13.2484L6.42574 16.0491L15.985 6.30159L13.1291 3.50089Z" fill="#6c63ff" mask="url(#path-1-inside-1_18_421)"/>
    </svg>`;

  deleteBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none">
    <path stroke="#CC1E1E" stroke-width="4" d="M7.071 21.213 21.213 7.071M21.213 21.213 7.071 7.071"/></svg>`;

  noteInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      saveEdit(noteElem);
    }
  });
}

function saveEdit(noteElem) {
  const id = noteElem.dataset.id;
  const noteInput = noteElem.querySelector(".note__input");
  const newText = noteInput.value.trim();

  if (!newText) return;

  state.notes = state.notes.map((note) => {
    if (note.id === id) {
      return {
        ...note,
        text: newText,
      };
    }
    return note;
  });

  saveToLocalStorage();
  renderNotes();
}

function cancelEdit(noteElem) {
  const noteText = noteElem.querySelector(".note__text");
  const noteInput = noteElem.querySelector(".note__input");

  noteElem.value = noteText.textContent;

  noteElem.classList.remove("note--editing");
  noteInput.classList.add("none");
  noteText.classList.remove("none");

  renderNotes();
}

function noteHandleClick({ target }) {
  const noteElement = target.closest(".note");
  if (!noteElement) return;

  const noteId = noteElement.dataset.id;
  const isEditing = noteElement.classList.contains("note--editing");

  if (target.closest("[class*='delete']")) {
    if (isEditing) {
      cancelEdit(noteElement);
    } else {
      noteElement.classList.add("is-dissapearing");
      setTimeout(() => {
        deleteNote(noteId);

        if (state.undoTimer) {
          clearInterval(state.undoTimer);
          state.deletedIndex = null;
          state.deletedNote = null;
        }

        showUndo();
      }, 300);
    }
  }

  if (target.closest("[class*='edit']")) {
    if (isEditing) {
      saveEdit(noteElement);
    } else {
      startEdit(noteElement);
    }
  }

  if (target.closest("[class*='checkbox']")) {
    if (!isEditing) {
      toggleCompletedNote(noteId);
    }
  }
}

newNoteBtn.addEventListener("click", () => {
  modal.classList.add("open");
  modalInput.focus();
});

cancelBtn.addEventListener("click", () => {
  modal.classList.remove("open");
  modalInput.value = "";
});

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modal.classList.remove("open");
    modalInput.value = "";
  }
});

modalForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const noteText = modalInput.value.trim();
  if (!noteText) return;

  addNewNote(noteText);

  modal.classList.remove("open");
  modalInput.value = "";
});

notesList.addEventListener("click", noteHandleClick);

searchInput.addEventListener("input", (e) => {
  state.searchQuery = e.target.value.toLowerCase();
  renderNotes();
});

dropDownBtn.addEventListener("click", () => {
  dropdownMenu.classList.toggle("active");
});

dropdownMenu.addEventListener("click", (e) => {
  state.statusFilter = e.target.dataset.value;
  dropDownBtn.firstChild.textContent = state.statusFilter;
  dropdownMenu.classList.remove("active");
  renderNotes();
});

renderNotes();
