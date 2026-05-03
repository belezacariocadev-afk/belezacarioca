export type PartnerMaterialGalleryImage = {
  id: string;
  title: string;
  previewSrc: string;
  downloadSrc: string;
  alt: string;
};

export type PartnerMaterialGallery = {
  materialId: string;
  title: string;
  description: string;
  packageDownloadUrl: string;
  packageFileName: string;
  images: PartnerMaterialGalleryImage[];
};

const storyImages: PartnerMaterialGalleryImage[] = [
  {
    id: 'story-01',
    title: 'Arte 01',
    previewSrc: '/assets/partner/materials/story/01.png',
    downloadSrc: '/assets/partner/materials/story/01.png',
    alt: 'Arte de divulgacao Beleza Carioca 01',
  },
  {
    id: 'story-02',
    title: 'Arte 02',
    previewSrc: '/assets/partner/materials/story/02.png',
    downloadSrc: '/assets/partner/materials/story/02.png',
    alt: 'Arte de divulgacao Beleza Carioca 02',
  },
  {
    id: 'story-03',
    title: 'Arte 03',
    previewSrc: '/assets/partner/materials/story/03.png',
    downloadSrc: '/assets/partner/materials/story/03.png',
    alt: 'Arte de divulgacao Beleza Carioca 03',
  },
  {
    id: 'story-04',
    title: 'Arte 04',
    previewSrc: '/assets/partner/materials/story/04.png',
    downloadSrc: '/assets/partner/materials/story/04.png',
    alt: 'Arte de divulgacao Beleza Carioca 04',
  },
];

const feedImages: PartnerMaterialGalleryImage[] = [
  {
    id: 'feed-01',
    title: 'Arte 01',
    previewSrc: '/assets/partner/materials/feed/01.png',
    downloadSrc: '/assets/partner/materials/feed/01.png',
    alt: 'Arte de feed Beleza Carioca 01',
  },
  {
    id: 'feed-02',
    title: 'Arte 02',
    previewSrc: '/assets/partner/materials/feed/02.png',
    downloadSrc: '/assets/partner/materials/feed/02.png',
    alt: 'Arte de feed Beleza Carioca 02',
  },
  {
    id: 'feed-03',
    title: 'Arte 03',
    previewSrc: '/assets/partner/materials/feed/03.png',
    downloadSrc: '/assets/partner/materials/feed/03.png',
    alt: 'Arte de feed Beleza Carioca 03',
  },
];

export const partnerMaterialGalleries: PartnerMaterialGallery[] = [
  {
    materialId: 'material-story',
    title: 'Artes para Story',
    description: 'Pacote visual para stories com foco em conversao de parceiros.',
    packageDownloadUrl: '/assets/partner/materials/story/pacote-story.zip',
    packageFileName: 'pacote-artes-story-beleza-carioca.zip',
    images: storyImages,
  },
  {
    materialId: 'material-feed',
    title: 'Artes para Feed',
    description: 'Pacote visual para feed e carrossel com posicionamento comercial.',
    packageDownloadUrl: '/assets/partner/materials/feed/pacote-feed.zip',
    packageFileName: 'pacote-artes-feed-beleza-carioca.zip',
    images: feedImages,
  },
];

export function getMaterialGalleryByMaterialId(materialId: string) {
  return partnerMaterialGalleries.find((item) => item.materialId === materialId);
}
