import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import { Box, Button, Collapse } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
 
const ReadMoreLess = ({ children, height = 50 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(true);
    const contentRef = useRef(null);
 
    useEffect(() => {
        if (contentRef.current) {
            setIsOverflowing(contentRef.current.scrollHeight > height);
        }
    }, [height, children]);
 
    const handleToggle = () => {
        setIsExpanded(!isExpanded);
    };
 
 
    const formatText = (text) => {
        // for desktop -> edge case
        if(typeof text === "object") {
            text = text[0];
        }
 
        // for mobile 
        const regex = /(Q\.)\s*(.*?)(?:\r?\n)(A\.)\s*(.*)/s;
        const match = text.match(regex);
    
        if (!match) return text;
    
        const parts = [match[1], match[2], match[3], match[4]];
    
        return (
            <>
                <strong>{parts[0]}</strong> {parts[1]} <br />
                <strong>{parts[2]}</strong> {parts[3]}
            </>
        );
    };
    
 
    return (
        <>
            {isOverflowing ? (
                <Box component="div">
                    <Collapse in={isExpanded} collapsedSize={height}>
                        <Box
                            ref={contentRef}
                            sx={{
                                overflow: "hidden",
                                height: "auto",
                                transition: "height 0.3s ease",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                            }}
                        >
                            {formatText(children)}
                        </Box>
                    </Collapse>
                    <Button
                        variant="text"
                        onClick={handleToggle}
                        endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    >
                        {isExpanded ? "Show less" : "Show more"}
                    </Button>
                </Box>
            ) : (
                <Box
                    component="div"
                    sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                    }}
                >
                    {formatText(children[0])}
                </Box>
            )}
        </>
    );
};
 
export default withErrorBoundary(ReadMoreLess, "ReadMoreLess");
 