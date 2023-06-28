import Form from 'react-bootstrap/Form';
import Cookies from 'js-cookie';
import {useEffect, useState} from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

function CustomCookieSwitch({toggleLabel, cookieKey}) {

    const initialSwitchState = Cookies.get(cookieKey) === 'true';
    const [switchState, setSwitchState] = useState(initialSwitchState);

    // Update the cookie when the switchState changes
    useEffect(() => {
        Cookies.set(cookieKey, switchState ? 'true' : 'false');
    }, [cookieKey, switchState]);

    const handleSwitchChange = (event) => {
        // Update the switchState when the switch is toggled
        setSwitchState(event.target.checked);
    };

    const renderTooltip = (props) => {
        return <Tooltip {...props}>{toggleLabel}</Tooltip>;
    };

    return (
        <Form>
            <OverlayTrigger
                style={{cursor: 'pointer'}}
                placement="bottom"
                overlay={renderTooltip}
                trigger={["hover", "focus"]}
            >
                <div>
                    <Form.Check
                        type="switch"
                        id="custom-switch"
                        checked={switchState} // use the switchState
                        onChange={handleSwitchChange}
                    />
                </div>
            </OverlayTrigger>
        </Form>
    );
}

export default CustomCookieSwitch;
