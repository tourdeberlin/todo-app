import { createElement } from "./utils.js";
const notesList = document.querySelector(".list");

const newNoteBtn = document.querySelector(".new-note-btn");
const modal = document.querySelector(".modal");
const modalInput = document.querySelector(".modal__input");
const cancelBtn = document.querySelector("#cancel-modal");
const modalOverlay = document.querySelector(".modal__overlay");
const modalForm = document.querySelector(".modal__form");

const notes = getNotesFromLocalStorage();
renderNotes();

function getNotesFromLocalStorage() {
  const data = localStorage.getItem("note-items");
  if (!data) {
    return [];
  }
  try {
    const parsedData = JSON.parse(data);
    return Array.isArray(parsedData) ? parsedData : [];
  } catch {
    console.error("Notes parse error");
    return [];
  }
}

function saveToLocalStorage() {
  localStorage.setItem("note-items", JSON.stringify(notes));
}

function addNewNote(newNoteText) {
  const newNote = {
    id: crypto?.randomUUID() ?? Date.now().toString(),
    text: newNoteText,
    completed: false,
  };
  notes.push(newNote);
  saveToLocalStorage();
  renderNotes();
  console.log(notes)
}

function renderNotes() {
  notesList.innerHTML = "";
  if (notes.length === 0) {
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
    console.log("empty");
  }

  notes.map((note) => {
    createNote(note);
  });
}

function createNote(newNote) {
  const task = createElement({
    tag: "div",
    parent: notesList,
    classNames: ["note"],
  });
  task.dataset.id = newNote.id;

  const label = createElement({
    tag: "label",
    parent: task,
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
  const taskInput = createElement({
    tag: "input",
    parent: task,
    classNames: ["note__input"],
  });
  taskInput.type = "text";

  const options = createElement({
    tag: "div",
    parent: task,
    classNames: ["note__options"],
  });
  const editOption = createElement({
    tag: "button",
    parent: options,
    classNames: ["option-btn", "edit-btn"],
  });
  editOption.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.17272 3.49106L0.5 10.1637V13.5H3.83636L10.5091 6.82736M7.17272 3.49106L9.5654 1.09837L9.5669 1.09695C9.8962 0.767585 10.0612 0.602613 10.2514 0.540824C10.4189 0.486392 10.5993 0.486392 10.7669 0.540824C10.9569 0.602571 11.1217 0.767352 11.4506 1.09625L12.9018 2.54738C13.2321 2.87769 13.3973 3.04292 13.4592 3.23337C13.5136 3.40088 13.5136 3.58133 13.4592 3.74885C13.3974 3.93916 13.2324 4.10414 12.9025 4.43398L12.9018 4.43468L10.5091 6.82736M7.17272 3.49106L10.5091 6.82736" stroke="#CDCDCD" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  const deleteOption = createElement({
    tag: "button",
    parent: options,
    classNames: ["option-btn", "delete-btn"],
  });

  deleteOption.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.87426 7.61505C3.80724 6.74386 4.49607 6 5.36983 6H12.6302C13.504 6 14.1928 6.74385 14.1258 7.61505L13.6065 14.365C13.5464 15.1465 12.8948 15.75 12.1109 15.75H5.88907C5.10526 15.75 4.4536 15.1465 4.39348 14.365L3.87426 7.61505Z" stroke="#CDCDCD"/>
    <path d="M14.625 3.75H3.375" stroke="#CDCDCD" stroke-linecap="round"/>
    <path d="M7.5 2.25C7.5 1.83579 7.83577 1.5 8.25 1.5H9.75C10.1642 1.5 10.5 1.83579 10.5 2.25V3.75H7.5V2.25Z" stroke="#CDCDCD"/>
    <path d="M10.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round"/>
    <path d="M7.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round"/>
    </svg>`;
}

newNoteBtn.addEventListener("click", () => {
  modal.classList.add("open");
  modalInput.focus();
});

cancelBtn.addEventListener("click", () => {
  modal.classList.remove("open");
});

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modal.classList.remove("open");
  }
});

modalForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const noteText = modalInput.value.trim();
  if (!noteText) return;

  addNewNote(noteText);
  modalInput.value = '';
  modal.classList.remove("open");
});
