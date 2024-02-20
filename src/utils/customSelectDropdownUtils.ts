export function setNextFocusableElement(popoverRef: React.RefObject<HTMLIonPopoverElement>, focusableElementId: string) {
  popoverRef?.current?.dismiss().then(() => {
    const focusable = document.getElementById(focusableElementId);

    focusable?.setAttribute('tabIndex', '-1');
    focusable?.focus({ preventScroll: false });
    focusable?.setAttribute('tabIndex', '0');
  });
}
