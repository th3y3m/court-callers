import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import BarChart from "../../components/BarChart";
import { fetchDailyRevenue } from "../../api/barApi"; // Import từ barApi.js

const Bar = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const result = await fetchDailyRevenue('your_branch_id'); // Thay 'your_branch_id' bằng giá trị thực tế
        const { revenue, changePercentage } = result;
        // Chuyển đổi dữ liệu phản hồi thành định dạng cần thiết cho biểu đồ
        setData([
          { id: 'Revenue', value: revenue }, 
          { id: 'Change Percentage', value: changePercentage }
        ]);
      } catch (error) {
        console.error("Error occurred while calling the API", error);
      }
    };

    getData();
  }, []);

  return (
    <Box m="20px">
      <Header title="Bar Chart" subtitle="Simple Bar Chart" />
      <Box height="75vh">
        <BarChart data={data} />
      </Box>
    </Box>
  );
};

export default Bar;
