import { flattenStyles } from "@mendix/piw-native-utils-internal";
import { createElement, ReactElement, useEffect, useRef, useState, Fragment } from "react";
import {
    ActivityIndicator,
    Platform,
    StatusBar,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import Video, { OnProgressData, VideoProperties } from "react-native-video";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/MaterialIcons";
import { VideoPlayerProps } from "../typings/VideoPlayerProps";
import { defaultVideoStyle, VideoStyle } from "./ui/Styles";
import { isAvailable } from "@mendix/piw-utils-internal";
import deepmerge from "deepmerge";

const enum StatusEnum {
    ERROR = "error",
    LOADING = "loading",
    READY = "ready",
    NOT_READY = "not-ready"
}

export function VideoPlayer(props: VideoPlayerProps<VideoStyle>): ReactElement {
    const [styles, setStyles] = useState(flattenStyles(defaultVideoStyle, props.style));
    const timeoutRef = useRef<NodeJS.Timeout>();

    const playerRef = useRef<Video>(null);
    const fullScreenPlayerRef = useRef<Video>(null);
    const [status, setStatus] = useState(StatusEnum.NOT_READY);
    const [videoAspectRatio, setVideoAspectRatio] = useState(0);
    const [fullScreen, setFullScreen] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [currentPlayTime, setCurrentPlayTime] = useState(0);

    useEffect(() => {
        const alteredStyles = deepmerge({}, styles);
        if (props.aspectRatio && videoAspectRatio !== 0) {
            alteredStyles.video.aspectRatio = videoAspectRatio;
            alteredStyles.container.aspectRatio = videoAspectRatio;
        } else if (!props.aspectRatio) {
            alteredStyles.container.aspectRatio = undefined;
            if (alteredStyles.video.width) {
                alteredStyles.container.width = alteredStyles.video.width;
            }
            if (alteredStyles.video.height) {
                alteredStyles.container.height = alteredStyles.video.height;
            }
        }
        setStyles(alteredStyles);
    }, [props.style, props.aspectRatio, videoAspectRatio]);

    useEffect(() => {
        if (props.showControls) {
            handleShowControls(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fullScreen]);

    function handleShowControls(setShown?: boolean): void {
        if (!props.showControls) {
            return;
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current as NodeJS.Timeout);
        }

        if (!showControls || setShown) {
            setShowControls(true);
            timeoutRef.current = global.setTimeout(() => {
                setShowControls(false);
            }, 5000);
        } else {
            setShowControls(false);
        }
    }

    function fullScreenHandler(isFullScreen: boolean): void {
        setFullScreen(isFullScreen);
        StatusBar.setHidden(isFullScreen);
    }

    const videoProps: VideoProperties = {
        testID: props.name,
        source: { uri: isAvailable(props.videoUrl) ? props.videoUrl.value : undefined },
        muted: props.muted,
        repeat: props.loop,
        controls: props.showControls,
        onLoadStart: () => setStatus(StatusEnum.LOADING),
        onError: () => {
            setStatus(StatusEnum.ERROR);
        },
        useTextureView: false,
        resizeMode: props.aspectRatio ? "contain" : "stretch",
        onProgress: ({ currentTime }: OnProgressData) => {
            setCurrentPlayTime(currentTime);
        }
    };

    const isAndroid = Platform.OS === "android";

    return (
        <Fragment>
            {isAndroid && (
                <Modal
                    isVisible={fullScreen}
                    style={styles.fullScreenVideoPlayer}
                    onBackButtonPress={() => {
                        fullScreenHandler(false);
                    }}
                >
                    <TouchableWithoutFeedback onPress={() => handleShowControls()}>
                        <Video
                            {...videoProps}
                            ref={fullScreenPlayerRef}
                            paused={false}
                            onLoad={data => {
                                setStatus(StatusEnum.READY);
                                setVideoAspectRatio(data.naturalSize.width / data.naturalSize.height);
                                fullScreenPlayerRef.current?.seek(currentPlayTime);
                            }}
                            style={styles.fullScreenVideoStyle}
                        />
                    </TouchableWithoutFeedback>
                    {showControls && (
                        <TouchableOpacity
                            style={styles.controlBtnContainerStyle}
                            onPress={() => {
                                fullScreenHandler(false);
                            }}
                        >
                            <Icon name="fullscreen-exit" color="white" size={22} />
                        </TouchableOpacity>
                    )}
                    {status === StatusEnum.LOADING && (
                        <ActivityIndicator
                            color={styles.indicator.color}
                            size="large"
                            style={styles.fullScreenActivityIndicatorStyle}
                        />
                    )}
                    {status === StatusEnum.ERROR && (
                        <Text style={styles.errorMessage}>The video failed to load :(</Text>
                    )}
                </Modal>
            )}
            <View style={styles.container}>
                {status === StatusEnum.LOADING && <ActivityIndicator color={styles.indicator.color} size="large" />}
                {status === StatusEnum.ERROR && <Text style={styles.errorMessage}>The video failed to load :(</Text>}
                {!fullScreen && (
                    <TouchableWithoutFeedback style={styles.container} onPress={() => handleShowControls()}>
                        <Video
                            {...videoProps}
                            paused={!props.autoStart && !currentPlayTime}
                            onLoad={data => {
                                setStatus(StatusEnum.READY);
                                setVideoAspectRatio(data.naturalSize.width / data.naturalSize.height);
                                playerRef.current?.seek(currentPlayTime);
                            }}
                            ref={playerRef}
                            style={status !== StatusEnum.READY ? { height: 0 } : styles.video}
                            onProgress={({ currentTime }) => {
                                setCurrentPlayTime(currentTime);
                            }}
                        />
                    </TouchableWithoutFeedback>
                )}
                {isAndroid && showControls && (
                    <TouchableOpacity
                        onPress={() => {
                            fullScreenHandler(true);
                        }}
                        style={styles.controlBtnContainerStyle}
                    >
                        <Icon name="fullscreen" color="white" size={22} />
                    </TouchableOpacity>
                )}
            </View>
        </Fragment>
    );
}
