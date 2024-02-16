export function setNextFocusableElement(popoverRef: React.RefObject<HTMLIonPopoverElement>, focusableElementId: string) {
  popoverRef?.current?.dismiss().then(() => {
    const sortButton = document.getElementById(focusableElementId);

    sortButton?.setAttribute('tabIndex', '-1');
    sortButton?.focus({ preventScroll: false });
    sortButton?.removeAttribute('tabIndex');
  });
}
