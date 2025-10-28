export interface UIControls {
  placeButton: HTMLButtonElement;
  startButton: HTMLButtonElement;
  container: HTMLElement;
  instructions: HTMLParagraphElement;
}

/**
 * Builds the simple on-screen UI for placing objects.
 */
export const createUI = (mountNode: HTMLElement): UIControls => {
  const container = document.createElement("div");
  container.id = "ui-container";

  const instructions = document.createElement("p");
  instructions.id = "ui-instructions";
  instructions.textContent = "Move your device to detect a surface.";

  const startButton = document.createElement("button");
  startButton.id = "start-button";
  startButton.type = "button";
  startButton.textContent = "Start AR";
  startButton.classList.add("ui-button");

  const placeButton = document.createElement("button");
  placeButton.id = "place-button";
  placeButton.type = "button";
  placeButton.textContent = "Place Object";
  placeButton.classList.add("ui-button", "primary-action");

  container.appendChild(instructions);
  container.appendChild(startButton);
  container.appendChild(placeButton);
  mountNode.appendChild(container);

  return { placeButton, startButton, container, instructions };
};
