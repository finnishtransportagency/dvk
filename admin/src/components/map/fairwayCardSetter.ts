import Feature from 'ol/Feature';
import { DvkMap, getMap } from './DvkMap';
import { Geometry } from 'ol/geom';
import { Area, Fairway, FairwayCardPartsFragment, Harbor } from '../../graphql/generated';
import { getFairwayAreaBorderFeatures } from '../../fairwayareaworker/FairwayAreaUtils';
import { addQuay, getFittingPadding } from './layers';
import * as olExtent from 'ol/extent';
import VectorSource from 'ol/source/Vector';

export function unsetSelectedFairwayCard() {
  const dvkMap = getMap();
  const line12Source = dvkMap.getVectorSource('line12');
  const line3456Source = dvkMap.getVectorSource('line3456');
  const area12Source = dvkMap.getVectorSource('area12');
  const area3456Source = dvkMap.getVectorSource('area3456');
  const quaySource = dvkMap.getVectorSource('quay');
  const selectedFairwayCardSource = dvkMap.getVectorSource('selectedfairwaycard');
  const depthSource = dvkMap.getVectorSource('depth12');
  const specialArea2Source = dvkMap.getVectorSource('specialarea2');
  const specialArea9Source = dvkMap.getVectorSource('specialarea9');
  const specialArea15Source = dvkMap.getVectorSource('specialarea15');
  const boardLine12Source = dvkMap.getVectorSource('boardline12');
  const harborSource = dvkMap.getVectorSource('harbor');
  const circleSource = dvkMap.getVectorSource('circle');
  const oldSelectedFeatures = selectedFairwayCardSource.getFeatures().concat(quaySource.getFeatures());
  for (const feature of oldSelectedFeatures) {
    switch (feature.getProperties().dataSource) {
      case 'line12':
        line12Source.addFeature(feature);
        feature.unset('n2000HeightSystem');
        break;
      case 'line3456':
        line3456Source.addFeature(feature);
        break;
      case 'area12':
        area12Source.addFeature(feature);
        feature.unset('n2000HeightSystem');
        (depthSource.getFeatureById(feature.getId() as number) as Feature<Geometry>)?.unset('n2000HeightSystem');
        break;
      case 'area3456':
        area3456Source.addFeature(feature);
        break;
      case 'specialarea2':
        specialArea2Source.addFeature(feature);
        feature.unset('n2000HeightSystem');
        break;
      case 'specialarea9':
        specialArea9Source.addFeature(feature);
        feature.unset('n2000HeightSystem');
        break;
      case 'specialarea15':
        specialArea15Source.addFeature(feature);
        feature.unset('n2000HeightSystem');
        break;
      case 'boardline12':
        boardLine12Source.addFeature(feature);
        break;
      case 'harbor':
        harborSource.addFeature(feature);
        break;
      case 'circle':
        circleSource.addFeature(feature);
        break;
    }
  }
  selectedFairwayCardSource.getFeatures().forEach((f) => f.set('selected', false, true));
  selectedFairwayCardSource.clear();
  quaySource.clear();
}

function setFairwayLines(fairway: Fairway, isN2000HeightSystem: boolean, selectedFeatures: Feature[], dvkMap: DvkMap) {
  const line12Source = dvkMap.getVectorSource('line12');
  const line3456Source = dvkMap.getVectorSource('line3456');
  const boardLine12Source = dvkMap.getVectorSource('boardline12');

  for (const line of fairway.navigationLines ?? []) {
    let feature = line12Source.getFeatureById(line.id) as Feature<Geometry>;
    if (feature) {
      line12Source.removeFeature(feature);
      selectedFeatures.push(feature);
      feature.set('n2000HeightSystem', isN2000HeightSystem);
    } else {
      feature = line3456Source.getFeatureById(line.id) as Feature<Geometry>;
      if (feature) {
        line3456Source.removeFeature(feature);
        selectedFeatures.push(feature);
      }
    }
  }
  for (const line of fairway.boardLines ?? []) {
    const feature = boardLine12Source.getFeatureById(line.id) as Feature<Geometry>;
    if (feature) {
      boardLine12Source.removeFeature(feature);
      selectedFeatures.push(feature);
    }
  }
}

function addAreaToSelectedFeatures(source: VectorSource<Feature<Geometry>>, area: Area, selectedFeatures: Feature<Geometry>[], isN2000?: boolean) {
  const feature = source.getFeatureById(area.id) as Feature<Geometry>;
  if (feature) {
    source.removeFeature(feature);
    selectedFeatures.push(feature);
    if (isN2000 !== undefined) {
      feature.set('n2000HeightSystem', isN2000);
    }
  }
}

function setFairwayAreas(fairway: Fairway, isN2000HeightSystem: boolean, selectedFeatures: Feature[], dvkMap: DvkMap) {
  const area12Source = dvkMap.getVectorSource('area12');
  const area3456Source = dvkMap.getVectorSource('area3456');
  const depthSource = dvkMap.getVectorSource('depth12');
  const specialArea2Source = dvkMap.getVectorSource('specialarea2');
  const specialArea9Source = dvkMap.getVectorSource('specialarea9');
  const specialArea15Source = dvkMap.getVectorSource('specialarea15');

  for (const area of fairway.areas ?? []) {
    let feature = area12Source.getFeatureById(area.id) as Feature<Geometry>;
    if (feature) {
      area12Source.removeFeature(feature);
      selectedFeatures.push(feature);
      feature.set('n2000HeightSystem', isN2000HeightSystem);
      feature = depthSource.getFeatureById(area.id) as Feature<Geometry>;
      feature?.set('n2000HeightSystem', isN2000HeightSystem);
    } else {
      addAreaToSelectedFeatures(area3456Source, area, selectedFeatures);
    }
    if (!feature) {
      addAreaToSelectedFeatures(specialArea2Source, area, selectedFeatures, isN2000HeightSystem);
    }
    if (!feature) {
      addAreaToSelectedFeatures(specialArea9Source, area, selectedFeatures, isN2000HeightSystem);
    }
  }
  for (const prohibitionArea of fairway.prohibitionAreas ?? []) {
    const feature = specialArea15Source.getFeatureById(prohibitionArea.id) as Feature<Geometry>;
    if (feature) {
      specialArea15Source.removeFeature(feature);
      selectedFeatures.push(feature);
    }
  }
}

function setFairwayCircles(fairway: Fairway, selectedFeatures: Feature[], dvkMap: DvkMap) {
  const circleSource = dvkMap.getVectorSource('circle');

  for (const circle of fairway.turningCircles ?? []) {
    const feature = circleSource.getFeatureById(circle.id) as Feature<Geometry>;
    if (feature) {
      circleSource.removeFeature(feature);
      selectedFeatures.push(feature);
    }
  }
}

function setFairwayFeatures(fairwayCard: FairwayCardPartsFragment, selectedFeatures: Feature[], dvkMap: DvkMap) {
  const isN2000HeightSystem = fairwayCard.n2000HeightSystem || false;

  for (const fairway of fairwayCard?.fairways || []) {
    setFairwayLines(fairway, isN2000HeightSystem, selectedFeatures, dvkMap);
    setFairwayAreas(fairway, isN2000HeightSystem, selectedFeatures, dvkMap);
    setFairwayCircles(fairway, selectedFeatures, dvkMap);
  }
}

function setHarbors(harbors: Harbor[] | undefined | null, selectedFeatures: Feature[], dvkMap: DvkMap) {
  const quaySource = dvkMap.getVectorSource('quay');
  const harborSource = dvkMap.getVectorSource('harbor');

  for (const harbor of harbors ?? []) {
    const id = harbor.geometry?.coordinates?.join(';');
    const feature = id ? (harborSource.getFeatureById(id) as Feature<Geometry>) : undefined;
    if (feature) {
      harborSource.removeFeature(feature);
      selectedFeatures.push(feature);
    }
    addQuay(harbor, quaySource);
  }
}

function setFairwayAreaBorders(selectedFeatures: Feature[]) {
  const area12Features = selectedFeatures.filter((f) => f.get('dataSource') === 'area12');
  const borderLineFeatures = getFairwayAreaBorderFeatures(area12Features);
  borderLineFeatures.forEach((f) => {
    f.set('dataSource', 'area12Borderline', true);
    selectedFeatures.push(f);
  });
}

function setExtent(selectedFeatures: Feature[], dvkMap: DvkMap) {
  const extent = olExtent.createEmpty();
  for (const feature of selectedFeatures) {
    const geom = feature.getGeometry();
    if (geom) {
      olExtent.extend(extent, geom.getExtent());
    }
  }
  if (!olExtent.isEmpty(extent)) {
    dvkMap.olMap?.getView().fit(extent, { padding: getFittingPadding(), duration: 1000 });
  }
}

export function setSelectedFairwayCard(fairwayCard: FairwayCardPartsFragment | undefined) {
  const dvkMap = getMap();
  if (fairwayCard) {
    const selectedFairwayCardSource = dvkMap.getVectorSource('selectedfairwaycard');
    unsetSelectedFairwayCard();

    const selectedFeatures: Feature[] = [];

    setFairwayFeatures(fairwayCard, selectedFeatures, dvkMap);
    setHarbors(fairwayCard?.harbors, selectedFeatures, dvkMap);
    setFairwayAreaBorders(selectedFeatures);

    selectedFeatures.forEach((f) => f.set('selected', true, true));
    selectedFairwayCardSource.addFeatures(selectedFeatures);

    setExtent(selectedFeatures, dvkMap);
  }
}
