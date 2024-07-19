import { memo, useState, useEffect } from "react";
import "./style.scss";
import "./styleHeader.scss"
import { AiOutlineUser } from "react-icons/ai";
import { MdOutlineGridView } from "react-icons/md";
import { LuHeartHandshake } from "react-icons/lu";
import { RiLogoutBoxRFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ROUTERS } from "utils/router";
import { Slide, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from 'AuthContext';
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [userPic, setUserPic] = useState('')
  // console.log("userData", userData)
  // console.log("user", user)

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded = jwtDecode(token);
      setUserName(decoded.name)
      setUserPic(decoded.picture)

      const fetchUserData = async (id, isGoogle) => {
        try {
          if (isGoogle) {
            const response = await axios.get(
              `https://courtcaller.azurewebsites.net/api/UserDetails/GetUserDetailByUserEmail/${id}`
            );
            setUserData(response.data);
            const userResponse = await axios.get(
              `https://courtcaller.azurewebsites.net/api/Users/GetUserDetailByUserEmail/${id}?searchValue=${id}`
            );
            setUser(userResponse.data);
          } else {
            const response = await axios.get(
              `https://courtcaller.azurewebsites.net/api/UserDetails/${id}`
            );
            setUserData(response.data);
            const userResponse = await axios.get(
              `https://courtcaller.azurewebsites.net/api/Users/${id}`
            );
            setUser(userResponse.data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      if (decoded.iss !== "https://accounts.google.com") {
        const userId = decoded.Id;
        setUserId(userId);
        fetchUserData(userId, false);
      } else {
        const userId = decoded.email;
        setUserId(userId);
        fetchUserData(userId, true);
      }
    }
  }, []);
  
  const [menus] = useState([
    {
      name: "Home",
      path: ROUTERS.USER.HOME,
    },
    // {
    //   name: "Schedule Booking",
    //   path: ROUTERS.USER.SCHEDULEPAGE,
    // },
    {
      name: "News",
      path: ROUTERS.USER.NEWS,
    },
    {
      name: "Booked",
      path: ROUTERS.USER.BOOKED,
    }
  ]);

  const handleLogout = () => {
    logout();
    navigate(ROUTERS.USER.LOGIN);
  };

  const toggleProfilePopup = () => {
    setShowProfilePopup(!showProfilePopup);
  };

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-xl-3 ">
            <div className="header_logo">
              <h1>Court Caller</h1>
            </div>
          </div>
          <div className="col-xl-6 ">
            <nav className="header_menu">
              <ul>
                {menus?.map((menu, menuKey) => (
                  <li key={menuKey} className={menuKey === 0 ? "active" : ""}>
                    <Link to={menu?.path}>{menu?.name}</Link>
                    {menu.child && (
                      <ul className="header_menu_dropdown">
                        {menu.child.map((childItem, childKey) => (
                          <li key={`${menuKey}-${childKey}`}>
                            <Link to={childItem.path}>{childItem.name}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="col-xl-3">
            <div className="header_login">
              <ul>
                {user ? (
                  <li className="profile-section">
                    <div className="profile-button" >
                      <button className="button2" onClick={toggleProfilePopup}>Profile</button>
                    </div>
                    <div className={`profile-popup ${showProfilePopup ? 'active' : ''}`}>
                      <div className="profile-info">
                        <div className="profile-pic">
                          <img src={userData.profilePicture || userPic} alt="Avatar" />
                        </div>
                        <p style={{fontSize: "medium", fontWeight: "bold", margin: "10px 0 3px"}}>{user.userName}</p>
                        <p>Balance: {userData.balance}</p>
                      </div>
                      <ul className="profile-actions">
                        <li>
                        <MdOutlineGridView style={{fontSize: 20}} />
                        <Link to="/profile">View profile</Link>
                        </li>
                        
                        <li onClick={handleLogout}>
                        <RiLogoutBoxRFill style={{fontSize: 20}} />
                          <a>Log out</a>
                        </li>
                      </ul>
                    </div>
                  </li>
                ) : (
                  <li>
                    <ToastContainer
                      transition={Slide}
                      autoClose={1500}
                      newestOnTop={true}
                      pauseOnHover={true}
                      pauseOnFocusLoss={false}
                      limit={5}
                    />
                    <Link to={ROUTERS.USER.LOGIN}>
                      <AiOutlineUser />
                      <span>Log In</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(Header);
