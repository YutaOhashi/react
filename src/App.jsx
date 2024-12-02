import { useEffect, useState } from "react";

export default function App() {
    const [monsters, setMonsters] = useState([]);
    const [locations, setLocations] = useState([]);
    const [filteredMonsters, setFilteredMonsters] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [expandedLocations, setExpandedLocations] = useState({});
    const [expandedTypes, setExpandedTypes] = useState({ small: false, large: false });
    const [isSorted, setIsSorted] = useState(false);

    // ソート前の順番を保持するための状態
    const [originalMonsters, setOriginalMonsters] = useState([]);
    const [originalLocations, setOriginalLocations] = useState([]);

    // データの取得
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [monstersResponse, locationsResponse] = await Promise.all([ 
                    fetch("https://mhw-db.com/monsters"), 
                    fetch("https://mhw-db.com/locations") 
                ]);
                const monstersData = await monstersResponse.json();
                const locationsData = await locationsResponse.json();

                setMonsters(monstersData);
                setLocations(locationsData);
                setFilteredLocations(locationsData);
                setFilteredMonsters(monstersData);
                setOriginalMonsters(monstersData);  // 元のモンスターリストを保存
                setOriginalLocations(locationsData);  // 元のロケーションリストを保存
            } catch (error) {
                console.error("データの取得に失敗しました:", error);
            }
        };

        fetchData();
    }, []);

    // 並べ替え処理
    const handleSortToggle = () => {
        setIsSorted(!isSorted);
    };

    // 並べ替えとフィルタリング
    useEffect(() => {
        let updatedMonsters = [...monsters];
        let updatedLocations = [...locations];

        // カテゴリ（場所）によるフィルタリング
        if (category !== "All") {
            updatedMonsters = updatedMonsters.filter(monster =>
                monster.locations.some(location => location.name === category)
            );
            updatedLocations = updatedLocations.filter(location => location.name === category);
        }

        // 検索キーワードによるフィルタリング
        if (searchTerm) {
            updatedMonsters = updatedMonsters.filter(monster =>
                monster.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            updatedLocations = updatedLocations.filter(location =>
                location.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // ソート処理
        if (isSorted) {
            updatedMonsters = updatedMonsters.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
            updatedLocations = updatedLocations.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        }

        setFilteredMonsters(updatedMonsters);
        setFilteredLocations(updatedLocations);
    }, [searchTerm, category, isSorted, monsters, locations]);

    // ロケーションの変更
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const handleFilterClick = () => {
        setCategory(selectedCategory);
    };

    const toggleLocation = (locationId) => {
        setExpandedLocations((prevExpanded) => ({
            ...prevExpanded,
            [locationId]: !prevExpanded[locationId],
        }));
    };

    const toggleMonsterType = (type) => {
        setExpandedTypes(prevExpanded => ({
            ...prevExpanded,
            [type]: !prevExpanded[type]
        }));
    };

    const smallMonsters = filteredMonsters.filter(monster => monster.type === "small");
    const largeMonsters = filteredMonsters.filter(monster => monster.type === "large");

    return (
        <>
            <header>
                <h1>Monster Hunter World</h1>
            </header>
            <div>
                <aside>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label htmlFor="category">Choose a location:</label>
                            <select
                                id="category"
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                            >
                                <option value="All">All</option>
                                {locations.map(location => (
                                    <option key={location.id} value={location.name}>
                                        {location.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <button type="button" onClick={handleFilterClick}>Filter Locations</button>
                        </div>
                    </form>
                    {/* 並べ替えスライダー */}
                    <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
                        <label htmlFor="sortToggle" style={{ marginRight: "10px" }}>
                            Sort Alphabetically:
                        </label>
                        <span 
                            style={{
                                display: "inline-block",
                                width: "60px",
                                height: "30px",
                                borderRadius: "30px",
                                backgroundColor: isSorted ? "#28a745" : "#ccc",
                                position: "relative",
                                cursor: "pointer",
                                transition: "background-color 0.3s",
                            }}
                            onClick={handleSortToggle}
                        >
                            <span 
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: isSorted ? "30px" : "5px",
                                    transform: "translateY(-50%)",
                                    backgroundColor: "white",
                                    borderRadius: "50%",
                                    width: "20px",
                                    height: "20px",
                                    transition: "left 0.3s",
                                }}
                            ></span>
                        </span>
                    </div>
                </aside>

                <main>
                    {/* Location Section */}
                    <section>
                        <h2>Location: {category}</h2>
                        {category === "All" ? (
                            <div>
                                {filteredLocations.length === 0 ? (
                                    <p>No locations found.</p>
                                ) : (
                                    filteredLocations.map((location) => (
                                        <div key={location.id}>
                                            <div style={{ marginBottom: "16px" }}>
                                                <h3
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() => toggleLocation(location.id)}
                                                >
                                                    <span style={{ marginRight: "8px" }}>
                                                        {expandedLocations[location.id] ? "▾" : "▸"}
                                                    </span>
                                                    {location.name}
                                                </h3>
                                                <p>Zone Count: {location.zoneCount}</p>
                                            </div>

                                            <div
                                                style={{
                                                    display: expandedLocations[location.id] ? "block" : "none",
                                                    transition: "all 0.3s ease",
                                                }}
                                            >
                                                <p>Camps:</p>
                                                <ul>
                                                    {location.camps.map(camp => (
                                                        <li key={camp.id}>
                                                            <p>{camp.name} (Zone {camp.zone})</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            filteredLocations.length === 0 ? (
                                <p>No locations found for category {category}.</p>
                            ) : (
                                filteredLocations
                                    .filter(location => location.name === category)
                                    .map((location) => (
                                        <div key={location.id}>
                                            <div style={{ marginBottom: "16px" }}>
                                                <h3
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() => toggleLocation(location.id)}
                                                >
                                                    <span style={{ marginRight: "8px" }}>
                                                        {expandedLocations[location.id] ? "▾" : "▸"}
                                                    </span>
                                                    {location.name}
                                                </h3>
                                                <p>Zone Count: {location.zoneCount}</p>
                                            </div>

                                            <div
                                                style={{
                                                    display: expandedLocations[location.id] ? "block" : "none",
                                                    transition: "all 0.3s ease",
                                                }}
                                            >
                                                <p>Camps:</p>
                                                <ul>
                                                    {location.camps.map(camp => (
                                                        <li key={camp.id}>
                                                            <p>{camp.name} (Zone {camp.zone})</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))
                            )
                        )}
                    </section>
                    {/* Divider between sections */}
                    <section>
                        <h2>Monsters by Location</h2>

                        {/* Small Monsters Section */}
                        <div>
                            <h3
                                style={{ cursor: "pointer", color: "#007bff" }}
                                onClick={() => toggleMonsterType('small')}
                            >
                                ▸ Small Monsters ({smallMonsters.length})
                            </h3>
                            <div
                                style={{
                                    display: expandedTypes.small ? "block" : "none",
                                    transition: "all 0.3s ease",
                                }}
                            >
                                {smallMonsters.length === 0 ? (
                                    <p>No small monsters found.</p>
                                ) : (
                                    smallMonsters.map((monster) => (
                                        <div key={monster.id}>
                                            <h4>{monster.name}</h4>
                                            <p>{monster.description}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Large Monsters Section */}
                        <div>
                            <h3
                                style={{ cursor: "pointer", color: "#007bff" }}
                                onClick={() => toggleMonsterType('large')}
                            >
                                ▸ Large Monsters ({largeMonsters.length})
                            </h3>
                            <div
                                style={{
                                    display: expandedTypes.large ? "block" : "none",
                                    transition: "all 0.3s ease",
                                }}
                            >
                                {largeMonsters.length === 0 ? (
                                    <p>No large monsters found.</p>
                                ) : (
                                    largeMonsters.map((monster) => (
                                        <div key={monster.id}>
                                            <h4>{monster.name}</h4>
                                            <p>{monster.description}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
            <footer>
                <div
                    style={{
                        marginTop: "30px",
                        padding: "15px",
                        border: "2px solid #ccc",
                        borderRadius: "8px",
                        backgroundColor: "#f9f9f9",
                    }}
                >
                    <p><strong>氏名:</strong> 大橋祐太</p>
                    <p><strong>学生証番号:</strong> 5423032</p>
                    <p><strong>日本大学文理学部情報科学科 Webプログラミングの演習課題</strong></p>
                </div>
            </footer>
        </>
    );
}