using System.ComponentModel;

namespace API.Helper
{
    public class FormEmail
    {
        public static string EnailContent(string email, string token)
        {
            string style =
    @"
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
        }
        .container {
            width: 80%;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }
        .header img {
            width: 100px;
        }
        .header h4 {
            margin: 0;
            font-size: 24px;
            color: #333;
        }
        .content {
            padding-top: 20px;
        }
        .content h3 {
            margin-top: 0;
            font-size: 20px;
            color: #333;
        }
        .content p {
            font-size: 16px;
            color: #666;
            line-height: 1.5;
        }
        .push-button {
            text-align: center;
            margin-top: 20px;
        }
        button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            background-color: #ff7800;
            color: #fff;
            font-size: 18px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        button:hover {
            background-color: #e05600;
        }
        .note {
            margin-top: 20px;
            font-style: italic;
            color: #999;
        }
        .footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        .footer img {
            width: 60px;
        }
        .info p {
            margin: 5px 0;
            font-size: 14px;
            color: #666;
        }
    </style>
    ";

            string body =
                $@"
    <!DOCTYPE html>
    <html lang=""en"">
    <head>
        <meta charset=""UTF-8"">
        <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
        <title>Confirm Email</title>
        {style}
    </head>
    <body>
        <div class=""container"">
            <div class=""header"">
                <div>
                    <img src=""https://lh3.googleusercontent.com/a/ACg8ocKEkKpI234Sz5MYbjSn4riyzVTdZKzppETEfu90F7CxYkwAnLM=s288-c-no""
                        alt=""Logo"">
                </div>
                <h4>Xác nhận Email</h4>
            </div>
            <div class=""content"">
                <h3>Xác thực tài khoản của bạn</h3>
                <p>Bạn đã đăng ký sử dụng dịch vụ của chúng tôi với địa chỉ email: {email}.</p>
                <p>Vui lòng xác nhận email để hoàn tất quá trình đăng ký.</p>
                <div class=""push-button"">
                    <button>
                        <a style=""color: white; text-decoration: none;"" href=""{token}"">XÁC NHẬN EMAIL</a>
                    </button>
                </div>
                <div class=""note"">
                    <p>* Lưu ý: Tài khoản của bạn chỉ có thể hoạt động sau khi đã xác nhận email.</p>
                </div>
            </div>
            <div class=""footer"">
                <img src=""https://lh3.googleusercontent.com/a/ACg8ocKEkKpI234Sz5MYbjSn4riyzVTdZKzppETEfu90F7CxYkwAnLM=s288-c-no""
                    alt=""Logo"">
                <div class=""info"">
                    <p>+84 789 999 888</p>
                    <p>courtcallers@gmail.com</p>
                    <p>Court Caller address: 42 Cach Mang Thang Tam, 10 District, HCM City</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    ";
            return body;


        }
    }
}
