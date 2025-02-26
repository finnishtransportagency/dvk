import React, { ChangeEvent, Dispatch, SetStateAction, useRef, useState } from 'react';
import FileUploader from '../../utils/FileUploader';
import { useTranslation } from 'react-i18next';
import { getMap } from '../map/DvkMap';
import { Orientation } from '../../graphql/generated';
import { easeOut } from 'ol/easing';
import { fitSelectedFairwayCardOnMap } from '../map/layers';
import { importExternalImage, MapControlUploader, createMapImages } from '../../utils/mapExportToolUtils';

interface ExportMapControlProperties {
  mapControlUploader: MapControlUploader;
  printDisabled?: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fileUploader: FileUploader;
  setErrors: Dispatch<SetStateAction<string[]>>;
}

export const MapExportToolControls: React.FC<ExportMapControlProperties> = ({
  mapControlUploader,
  printDisabled,
  setIsOpen,
  isOpen,
  fileUploader,
  setErrors,
}) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'homePage.map.controls' });
  const dvkMap = getMap();
  const [orientationType, setOrientationType] = useState<Orientation | ''>(dvkMap.getOrientationType());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePictureUpload = (event: ChangeEvent) => {
    const fileErrors = fileUploader.addPicture(event);
    if (fileErrors.length > 0) {
      setErrors(fileErrors);
    }

    importExternalImage({ ...mapControlUploader, fileUploader });
    //so duplicates can be added
    (event.target as HTMLInputElement).value = '';
  };

  const handleOrientationChange = (orientation: Orientation) => {
    if (orientation === dvkMap.getOrientationType()) {
      setOrientationType('');
      dvkMap.setOrientationType('');
    } else {
      setOrientationType(orientation);
      dvkMap.setOrientationType(orientation);
    }
  };

  const zoomByDelta = (delta: number) => {
    const map = dvkMap.olMap;
    if (map) {
      const view = map.getView();
      if (!view) {
        // the map does not have a view, so we can't act
        // upon it
        return;
      }
      const currentZoom = view.getZoom();
      if (currentZoom !== undefined) {
        const newZoom = view.getConstrainedZoom(currentZoom + delta);

        if (view.getAnimating()) {
          view.cancelAnimations();
        }
        view.animate({
          zoom: newZoom,
          duration: 250,
          easing: easeOut,
        });
      }
    }
  };
  const disableModifyingControls = !dvkMap.getOrientationType() || printDisabled;
  return (
    <div className={'extControls ' + orientationType}>
      <div className="extControl selectPortraitControlContainer">
        <button
          className="selectPortraitControl"
          onClick={(ev) => {
            ev.preventDefault();
            handleOrientationChange(Orientation.Portrait);
          }}
          title={t('orientation.selectPortrait')}
          aria-label={t('orientation.selectPortrait')}
        />
      </div>
      <div className="extControl selectLandscapeControlContainer">
        <button
          className="selectLandscapeControl"
          onClick={(ev) => {
            ev.preventDefault();
            handleOrientationChange(Orientation.Landscape);
          }}
          title={t('orientation.selectLandscape')}
          aria-label={t('orientation.selectLandscape')}
        />
      </div>
      <div className="extControl takeScreenshotControlContainer">
        <button
          className="takeScreenshotControl"
          disabled={disableModifyingControls}
          onClick={(ev) => {
            ev.preventDefault();
            createMapImages(mapControlUploader);
          }}
          title={t('screenshot.tipLabel')}
          aria-label={t('screenshot.tipLabel')}
        />
      </div>
      <div className="extControl uploadPictureControlContainer">
        <button
          className="uploadPictureControl"
          type="button"
          disabled={disableModifyingControls}
          onClick={() => {
            fileInputRef.current?.click();
          }}
          title={t('upload.uploadPicture')}
          aria-label={t('upload.uploadPicture')}
        >
          <input
            id="fileInput"
            type="file"
            ref={fileInputRef}
            disabled={disableModifyingControls}
            onChange={handlePictureUpload}
            accept="image/png"
            style={{ display: 'none' }}
          />
        </button>
      </div>
      <div className="extControl layerControlContainer">
        <button
          className={'layerControlContainer ' + (isOpen ? 'layerControlOpen' : 'layerControl')}
          onClick={(ev) => {
            ev.preventDefault();
            setIsOpen(true);
          }}
          title={t('layer.tipLabel')}
          aria-label={t('layer.tipLabel')}
        />
      </div>
      <div className="extControl centerToOwnLocationControlContainer">
        <button
          className="centerToOwnLocationControl"
          onClick={(ev) => {
            ev.preventDefault();
            fitSelectedFairwayCardOnMap();
          }}
          title={t('features.tipLabel')}
          aria-label={t('features.tipLabel')}
        />
      </div>
      <div className="extControl zoomInControlContainer">
        <button
          className="zoomInControl"
          onClick={(ev) => {
            ev.preventDefault();
            zoomByDelta(1);
          }}
          title={t('zoom.zoomInTipLabel')}
          aria-label={t('zoom.zoomInTipLabel')}
        />
      </div>
      <div className="extControl zoomOutControlContainer">
        <button
          className="zoomOutControl"
          onClick={(ev) => {
            ev.preventDefault();
            zoomByDelta(-1);
          }}
          title={t('zoom.zoomOutTipLabel')}
          aria-label={t('zoom.zoomOutTipLabel')}
        />
      </div>
    </div>
  );
};
