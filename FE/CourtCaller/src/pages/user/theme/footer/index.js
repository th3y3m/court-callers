import { memo } from "react"
import './style.scss'
import { AiOutlineFacebook, AiOutlineInstagram, AiOutlinePhone } from "react-icons/ai";
import { FiYoutube, FiTwitter } from "react-icons/fi";
import { Email } from "@mui/icons-material";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="row">
                    <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12">
                        <div className="footer_about">
                            <h1 className="footer_about_logo">Court Caller</h1>
                            <ul>
                                <li>Address: FPT University</li>
                                <li>Phone: 123-456-789</li>
                                <li>Email: <a href="mailto:courtcallers@gmail.com">courtcallers@gmail.com</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                        <div className="footer_widget">
                            <h1>About us</h1>
                            <ul>
                                <li>Home Page</li>
                                <li>Schedule Booking</li>
                                <li>News</li>
                            </ul>

                            <ul>
                                <li>Booked</li>
                                <li>Introduction</li>
                                <li>Service</li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-12 col-sm-12 col-xs-12">
                        <div className="footer_widget">
                            <h1>Contact Media</h1>
                            <div className="select_bar_phone">
                                <div className="select_bar_phone_icon">
                                    <AiOutlinePhone />
                                </div>
                                <div className="select_bar_phone_text">
                                    <p>123.465.463</p>
                                    <span>Support 24/7</span>
                                </div>
                            </div>


                            <div className="footer_widget_social">
                                <div>
                                    <AiOutlineFacebook />
                                </div>
                                <div>
                                    <AiOutlineInstagram />
                                </div>
                                <div>
                                    <FiYoutube />
                                </div>
                                <div>
                                    <FiTwitter />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default memo(Footer);