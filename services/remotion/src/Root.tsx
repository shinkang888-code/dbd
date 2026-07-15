import { Composition } from "remotion";
import { StoryboardVideo, totalFrames, type StoryboardProps } from "./StoryboardVideo";

const FPS = 30;

// 기본(데모) 입력 — 실제 렌더 시 --props 로 스토리보드 JSON 주입
const DEFAULT: StoryboardProps = {
  bgmMood: "clean",
  brand: "LEXI",
  images: [],
  scenes: [
    { duration: 4, imageIndex: 0, overlayText: "속건조 끝" },
    { duration: 4, imageIndex: 1, overlayText: "하루종일 보습" },
    { duration: 4, imageIndex: 2, overlayText: "정품 직소싱" },
    { duration: 3, imageIndex: 3, overlayText: "지금 담기" },
  ],
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="StoryboardVideo"
    component={StoryboardVideo}
    durationInFrames={totalFrames(DEFAULT.scenes, FPS)}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={DEFAULT}
    // 스토리보드 길이에 맞춰 프레임 수 계산 (props 주입 시)
    calculateMetadata={({ props }) => ({
      durationInFrames: totalFrames(props.scenes, FPS),
      fps: FPS, width: 1080, height: 1920,
    })}
  />
);
